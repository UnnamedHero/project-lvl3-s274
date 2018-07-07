## JS backend. Hexlet education project #3. page-loader.

[![Build Status](https://travis-ci.org/UnnamedHero/project-lvl3-s274.svg?branch=master)](https://travis-ci.org/UnnamedHero/project-lvl3-s274)
[![Maintainability](https://api.codeclimate.com/v1/badges/b08dc1d650b8cc60093b/maintainability)](https://codeclimate.com/github/UnnamedHero/project-lvl3-s274/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b08dc1d650b8cc60093b/test_coverage)](https://codeclimate.com/github/UnnamedHero/project-lvl3-s274/test_coverage)

### Installation

```npm install -g eem-page-loader```

### Command line usage

```eem-page-loader [options] <targetUrl>```

    Options:

    -V, --version             output the version number
    -o, --output [directory]  Output folder (default: current folder)
    -h, --help                output usage information


    Parameters:

    <targetUrl>               Url address of a page to download, must begin with address schema like http:// or https://

### Debug

```DEBUG="page-loader:*" eem-page-loader [options] <targetUrl>```

## Описание

Цель: Основная задача этого проекта, показать общие принципы работы с асинхронным кодом в js. Затрагиваемые темы:

 - Тестирование с использованием Mock/Stub
 - Активный файловый ввод/вывод
 - Работа с ошибками и исключениями
 - Знакомство с модулями nodejs: os, path, fs, url
 - Работа с DOM. Базовые манипуляции
 - Promises, Async/Await
 - Работа с HTTP

Описание: реализовать утилиту для скачивания указанного адреса из сети. Принцип ее работы очень похож на то, что делает браузер при сохранении страниц сайтов.

