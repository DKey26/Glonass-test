import '../components/main.scss';

document.addEventListener('DOMContentLoaded', function(){
  let blocks = document.querySelectorAll('.block-wrapper');
  let pallete = document.querySelector('.palette');

  let blockWrapperFirst = blocks[0];
  let blockWrapperSecond = blocks[1];
  let blockWrapperThird = blocks[2];

  let components = {
    coordinates: pallete.querySelector('.coordinates-row').cloneNode(true),
    action: pallete.querySelector('.action').cloneNode(true),
    title: pallete.querySelector('.title').cloneNode(true)
  }

  let componentsCalculate = {
    coordinates: pallete.querySelector('.calculate-row').cloneNode(true),
    action: pallete.querySelector('.action').cloneNode(true),
    title: pallete.querySelector('.title').cloneNode(true)
  }

  let modalElement = document.querySelector('.modal-window');
  let pageWrapperElement = document.querySelector('.page-wrapper');
  
  let modalWindowInstance = new ModalWindow(modalElement, pageWrapperElement);

  let coordinatesInputsFirstInstance = new CoordinatesInputs(blockWrapperFirst, components);
  let coordinatesInputsSecondInstance = new CoordinatesInputs(blockWrapperSecond, components);
  let calculateInputsInstance = new CalculateInputs(blockWrapperThird, componentsCalculate, [coordinatesInputsFirstInstance, coordinatesInputsSecondInstance]);

  calculateInputsInstance.onCalculateCb(() => {
    modalWindowInstance.open();
    let canvas = document.getElementById('graph');
    let data = [coordinatesInputsFirstInstance.getAllValues(), coordinatesInputsSecondInstance.getAllValues(), calculateInputsInstance.getAllValues()];
    let graphInstance = new Graph(canvas, data);
  });

  

  document.getElementById('test-data').addEventListener('click', () => {
    let testData = prepareTestData();

    coordinatesInputsFirstInstance.removeAll();
    coordinatesInputsSecondInstance.removeAll();

    testData[0].forEach((data) => {
      coordinatesInputsFirstInstance.add(data);
    });

    testData[1].forEach((data) => {
      coordinatesInputsSecondInstance.add(data);
    });
    
  })
})

function prepareTestData() {
  let count1 = Math.floor(Math.random() * 8 + 2),
      count2 = Math.floor(Math.random() * 8 + 2);

  let data1 = [], 
      data2 = [];
  
  let savedX = 0;
  for(let i=0; i <= count1; i++) {
    let x = Math.floor(Math.random() * 30 + savedX);
    data1.push({
      x: x,
      y: Math.floor(Math.random() * 95 + 5) - 50,
    })
    savedX = x;
  }
  
  savedX = 0;
  for(let i=0; i <= count2; i++) {
    let x = Math.floor(Math.random() * 30 + savedX);
    data2.push({
      x: x,
      y: Math.floor(Math.random() * 95 + 5) - 50,
    })
    savedX = x;
  }
  return [data1, data2]
}

class Graph {
  constructor (canvas, data) {
    this.canvas = canvas;
    this.data = data;
    this.context2d = this.canvas.getContext('2d');
    this.wrapper = this.canvas.parentElement;
    this.mousePosition = {
      x: 0,
      y: 0
    };

    this.wrapperSize = {
      width: this.wrapper.offsetWidth,
      height: this.wrapper.offsetHeight
    };

    this.isGrabbed = false;
    this.grabPoint = {
      x: 0,
      y: 0
    };

    this.viewPosition = {
      x: this.wrapperSize.width / 2,
      y: this.wrapperSize.height / 2
    };

    this.settings = {
      scrollScale: 1,
      scale: 2,
      translate: {
        x: this.viewPosition.x,
        y: this.viewPosition.y
      }
    }

    this._init();
    this._addListeners();
  }

  _init() {
    this.canvas.setAttribute('width', `${this.wrapperSize.width}px`);
    this.canvas.setAttribute('height', `${this.wrapperSize.height}px`);
    
    this._drawOrdinates();
    this._drawGraph(this.data[0], 'green');
    this._drawGraph(this.data[1], 'red');
    this._drawGraph(this.data[2], 'blue');
  }

  _clear() {
    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _addListeners() {

    this.canvas.addEventListener('wheel', (event) => {
      this._clear();
      let beforeScale = this.settings.scale;
      this.settings.scrollScale -= event.deltaY / 1000;
      this.settings.scale = Math.pow(2, this.settings.scrollScale);
      this.settings.translate.x += ((this.mousePosition.x - this.settings.translate.x) / (this.wrapperSize.width * this.settings.scale)) * (this.wrapperSize.width * (beforeScale - this.settings.scale))
      this.settings.translate.y += ((this.mousePosition.y - this.settings.translate.y) / (this.wrapperSize.height * this.settings.scale)) * (this.wrapperSize.height * (beforeScale - this.settings.scale))
      this._drawOrdinates();
      this._drawGraph(this.data[0], 'green');
      this._drawGraph(this.data[1], 'red');
      this._drawGraph(this.data[2], 'blue');
    })

    this.canvas.addEventListener('mousedown', (event) => {
      this.isGrabbed = true;
      this.grabPoint = {
        x: event.offsetX - this.settings.translate.x,
        y: event.offsetY - this.settings.translate.y
      }
    })

    this.canvas.addEventListener('mouseup', (event) => {
      console.log('mouseup');
      this.isGrabbed = false;
    })

    this.canvas.addEventListener('mousemove', (event) => {
      this.mousePosition.x = event.offsetX;
      this.mousePosition.y = event.offsetY;

      if(this.isGrabbed) {
        this._clear();
      
        this.settings.translate.x = this.mousePosition.x - this.grabPoint.x;
        this.settings.translate.y = this.mousePosition.y - this.grabPoint.y;
        this._drawOrdinates();
        this._drawGraph(this.data[0], 'green');
        this._drawGraph(this.data[1], 'red');
        this._drawGraph(this.data[2], 'blue');
      }
    })
  }

  _drawOrdinates() {
    this._drawLine({
      x: -this.viewPosition.x,
      y: this.settings.translate.y
    },
    {
      x: this.wrapperSize.width,
      y: this.settings.translate.y
    });

    this._drawLine({
      x: this.settings.translate.x,
      y: -this.viewPosition.y
    },
    {
      x: this.settings.translate.x,
      y: this.wrapperSize.height
    });

    let step = this._getLineStep();
  }

  _getLineStep() {
    let borderCoordX = Math.trunc(this.viewPosition.x / this.settings.scale).toString();
    let count = Math.pow(10, borderCoordX.length - 1);
    let rounded = Math.trunc(borderCoordX / count) * count;

    console.log(rounded % (2*count) == 0, rounded % (5*count) == 0, rounded, 5*count);
  }

  _drawGraph(data, color) {
    for(let i=0; i < data.length-1; i++) {
      this._drawRelativeLine(data[i], data[i+1], color, 2);
      this._drawPoint(data[i], color);
    }
    this._drawPoint(data[data.length-1], color);
  }

  _drawRelativeLine(pos1, pos2, color = 'black', lineWidth) {
    let convertedPos1 = this._convertToGraphCoordinates(pos1);
    let convertedPos2 = this._convertToGraphCoordinates(pos2);

    this._drawLine(convertedPos1, convertedPos2, color, lineWidth);
  }

  _drawPoint(pos, color) {
    let radius = 3;
    let convertedPos = this._convertToGraphCoordinates(pos);
    this.context2d.beginPath();
    this.context2d.fillStyle = color;
    this.context2d.strokeStyle = color;
    this.context2d.arc(convertedPos.x, convertedPos.y, radius, 0, Math.PI*2);
    this.context2d.fill();
    this.context2d.closePath();
  }

  _drawLine(pos1, pos2, color = 'black', lineWidth = 1) {
    this.context2d.beginPath();
    this.context2d.fillStyle = color;
    this.context2d.strokeStyle = color;
    this.context2d.lineWidth = lineWidth;
    this.context2d.moveTo(pos1.x, pos1.y);
    this.context2d.lineTo(pos2.x, pos2.y);
    this.context2d.stroke();
    this.context2d.closePath();
  }

  _convertToGraphCoordinates(coordinates) {
    return {
      x: coordinates.x * this.settings.scale + this.settings.translate.x,
      y: -coordinates.y * this.settings.scale + this.settings.translate.y
    }
  }
}

class ModalWindow {
  constructor (wrapper, pageWrapper) {
    this.wrapper = wrapper;
    this.pageWrapper = pageWrapper;
    this.closeButton = null;

    this.activeClass = 'opened';
    this.pageWrapperActive = 'modal-active';

    this._init();
  }

  open() {
    this.wrapper.classList.add(this.activeClass);
    this.pageWrapper.classList.add(this.pageWrapperActive);
  }

  close() {
    this.wrapper.classList.remove(this.activeClass);
    this.pageWrapper.classList.remove(this.pageWrapperActive);
  }

  _init() {
    this.closeButton = this.wrapper.querySelector('.modal-window__close');

    this.closeButton.addEventListener('click', () => {
      this.close();
    })
  }
}

class CalculateInputs {
  constructor (wrapper, components, coordinatesInputs) {
    this.wrapper = wrapper;
    this.components = components;
    this.action = null;
    this.coordinatesInputs = coordinatesInputs;
    this._init();

    this._cbFn = () => {}
  }

  getAllValues() {
    let values = [];
    let rows = this.wrapper.querySelectorAll('.calculate-row');
    rows.forEach((row) => {
      let inputs = row.querySelectorAll('input');
      values.push({
        x: Number(inputs[0].value),
        y: Number(inputs[1].value)
      })
    })

    return values;
  }

  calculate() {
    let values = [];
    let lengths = [];
    this.coordinatesInputs.forEach((coordinatesInput) => {
      let coordinates = coordinatesInput.getAllValues();
      values.push(coordinates);
      lengths.push(coordinates.length);
    })

    let minRows = Math.min(...lengths);

    this._clearRows();

    for(let i=0; i < minRows; i++) {
      let resultCoordinates = {
        x: (values[0][i].x + values[1][i].x) / 2,
        y: (values[0][i].y + values[1][i].y) / 2,
      }

      this._addRow(resultCoordinates);
    }
    console.log(this)
    this._cbFn();
  }

  onCalculateCb(fn) {
    this._cbFn = fn;
  }

  _clearRows() {
    this.wrapper.querySelectorAll('.calculate-row').forEach((row) => {
      row.remove();
    })
  }

  _addRow(coordinates) {
    let coordinatesComponent = this._getCoordinatesTemplate();
    let inputs = coordinatesComponent.querySelectorAll('input');
    inputs[0].value = coordinates.x;
    inputs[1].value = coordinates.y;
    this.wrapper.insertBefore(coordinatesComponent, this.action);
  }

  _initDefaultFields() {
    let coordinatesComponent = this._getCoordinatesTemplate();
    this.wrapper.insertBefore(coordinatesComponent, this.action);
  }

  _init() {
    this._initTitle();
    this._initActionButton();
    this._initDefaultFields();
  }

  _initTitle() {
    this.wrapper.appendChild(this._getTitleTemplate());
  }

  _initActionButton() {
    this.action = this._getActionTemplate();
    this.wrapper.appendChild(this.action);

    this.action.addEventListener('click', () => {
      this.calculate();
    })
  }

  _getActionTemplate() {
    let action = this.components.action.cloneNode(true);
    let button = action.querySelector('button');
    button.innerHTML = 'Calculate';
    return action;
  }

  _getTitleTemplate() {
    let title = this.components.title;
    let cols = this.components.title.querySelectorAll('.col');
    cols[2].remove();

    return title;
  }

  _getCoordinatesTemplate() {
    return this.components.coordinates.cloneNode(true);
  }
}

class CoordinatesInputs {
  constructor (wrapper, components) {
    this.wrapper = wrapper;
    this.components = components;
    this.action = null;
    this.idList = [];

    this._init();
  }

  getAllValues() {
    let values = [];
    let rows = this.wrapper.querySelectorAll('.coordinates-row');
    rows.forEach((row) => {
      let inputs = row.querySelectorAll('input');
      values.push({
        x: Number(inputs[0].value),
        y: Number(inputs[1].value)
      })
    })

    return values;
  }

  delete(id) {
    let element = this._getRowById(id);
    element.remove();
    this.idList = this.idList.filter((idInList) => idInList !== id);
  }

  add(coordinates = undefined) {
    let currentId = this._getCurrentId();
    let coordinatesComponent = this._prepareCoordinatesComponent(currentId, coordinates);

    this.wrapper.insertBefore(coordinatesComponent, this.action);
    
    this.idList.push(currentId);
  }

  getIds() {
    return this.idList;
  }

  removeAll() {
    let rows = this.wrapper.querySelectorAll('.coordinates-row');
    rows.forEach((row) => {
      row.remove();
    });

    this.idList = [];
  }

  _prepareCoordinatesComponent(id, coordinates) {
    let coordinatesComponent = this._getCoordinatesTemplate();
    let button = coordinatesComponent.querySelector('.btn');
    let inputs = coordinatesComponent.querySelectorAll('input');

    if(!!coordinates) {
      inputs[0].value = coordinates.x;
      inputs[1].value = coordinates.y;
    }
    else {
      inputs[0].value = 0;
      inputs[1].value = 0;
    }

    button.innerHTML = 'Delete';
    button.setAttribute('data-id', id);
    coordinatesComponent.setAttribute('data-id', id);

    button.addEventListener('click', (event) => {
      let id = Number(event.currentTarget.getAttribute('data-id'));
      this.delete(id);
    })

    return coordinatesComponent;
  }

  _getRowById(id) {
    return this.wrapper.querySelector(`.coordinates-row[data-id="${id}"]`);
  }

  _getCurrentId() {
    if(!this.idList.length) {
      return 0;
    }

    return Math.max(...this.idList) + 1;
  }

  _initTitle() {
    this.wrapper.appendChild(this._getTitleTemplate());
  }

  _initActionButton() {
    this.action = this._getActionTemplate();
    this.wrapper.appendChild(this.action);

    this.action.addEventListener('click', () => {
      this.add();
    })
  }

  _init() {
    this._initTitle();
    this._initActionButton();
    this.add();
  }

  _getActionTemplate() {
    return this.components.action.cloneNode(true);
  }

  _getTitleTemplate() {
    return this.components.title.cloneNode(true);
  }

  _getCoordinatesTemplate() {
    return this.components.coordinates.cloneNode(true);
  }
}
