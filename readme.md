# Payler Wallet

Проект-заглушка для отправки заявок с email'ом пользователя

## Dependincies

Run `npm install` for install all dependincies.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:9000/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `build/` directory.

## Code scaffolding

Run `bem create blocks/pages/block-name` to generate a new block/component.

## Rules

1. Иерархия блоков `Layout > Pages > Sections > Items`

2. Отступы не задаются напрямую независимым блокам
   Решение:
   - Наследование через элемент
   - Добавление класса (можно сделать блок элементом)
   - Обертка (Тип: блок. Роль: только в позиционирование) Обертки по иерархии (п.1)

3. У последнего элемента группы, отступ обнуляется (всегда)

4. Использование переменных для:
   - Отступов между секциями
   - Размеров шрифтов, в том числе для шрифтов в media запросах
   - Цветов
   
   File: variables.scss