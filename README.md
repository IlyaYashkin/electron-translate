# Electron translate

Приложение для перевода текста на базе фреймворка Electron с использовнием библиотеки Translators (поддерживает большинство интерфейсов перевода: Google, Bing, Baidu, Deepl...).

## Запуск проекта

Сначала необходимо скомпилировать CLI из библиотеки translators

Create python CLI translator .exe file

```
pyinstaller --onefile --distpath ./ .\translators\translator.py
```

Установка библиотек

```
npm install
```
Запуск проекта

```
npm run dev
```
