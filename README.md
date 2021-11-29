[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-f059dc9a6f8d3a56e377f745f24479a46679e63a5d9fe6f495e02850cd0d8118.svg)](https://classroom.github.com/online_ide?assignment_repo_id=6314907&assignment_repo_type=AssignmentRepo)
# Problema PBL - Bem-vindo ao Metaverso.

<!-- Logo -->

<h1 align="center" style="font-family: Ubuntu; font-size: 45px; color: #333; margin-bottom: 0">
  Grupo 2
</h1>

<!-- Badges -->

<!-- <p align="center">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/igooralm192/nlw-01">
</p> -->

<!-- Description -->

<h4 align="center">
	🚀 Fases lunares em AR 🚀
</h4>

<!-- Summary -->

<h2>Summary</h2>

- [:framed_picture: Introdução](#framed_picture-introdução)
- [:rocket: Tecnologias](#rocket-tecnologias)
- [:boom: Como jogar](#boom-como-jogar)
- [:wrench: Relatório técnico](#wrench-environment-variables)

<a id="layout"></a>

## :framed_picture: Introdução

Trata-se de um jogo interativo em AR onde é possível visualizar a variação das fases lunares através dos movimentos que ocorrem entre a Lua e a Terra. É possível jogar a partir de qualquer dispositivo com câmera e acesso a browser.

<a id="tecnologias"></a>

## :rocket: Tecnologias

Para a construção do jogo foram usadas as seguintes tecnologias:

- [JavaScript](https://www.javascript.com/)
- [Three.Js](https://threejs.org/)
- [THREEAR](https://github.com/JamesLMilner/THREEAR)
- [Tween.Js](https://github.com/tweenjs/tween.js/)

<a id="como-executar"></a>

## :boom: Como jogar

#### Pré-requisitos

Para jogar é necessário um dispositivo com câmera e acesso a internet (ou pode executar o código localmente).

#### Jogando

##### Acesse o link abaixo no dispositivo com câmera
- https://igooralm192.github.io/metaverso-g2/

##### Aponte a câmera do dispositivo para a imagem:

<img src="https://github.com/JamesLMilner/THREEAR/blob/master/data/hiro.jpg" width="400px">

Mantenha a câmera na posição correta e manipule o cenário usando o cursor/touch.

<a id="variaveis-ambiente"></a>

## :wrench: Relatório técnico

O protótipo foi desenvolvido usando a biblioteca THREEAR, que é uma versão modificada do Three.Js, para a modelagem 3D aplicar a realidade aumentada e a biblioteca Tween.Js para aplicar alguma animações.

### Construção da scene

A construção da scene foi feita a partir do uso de uma PerspectiveCamera, AmbientLight e PointLight para simular a luz emitida pelo Sol, OrbitControls para permitir a movimentação da câmera pelo jogador (INSERIR COISA DE AR AQUI) e três objetos 3D: Terra, Sol e Lua.

### Objetos 3D

Os objetos foram criados a partir de uma geometria SphereGeometry para gerar um modelo esférico semelhante a um planeta e um MeshPhongMaterial para simular melhor a iluminação e reflexão do corpo celeste, utilizamos texturas de alta resolução para trazer um maior realismo. A rotação e translação da Terra e Lua foram pensados para ser semelhante com o modelo real para manter uma escala.

### Funcionamento do jogo

Para o funcionamento do jogo foram criados botões referentes às quatro fases da lua, que ao serem pressionados gera uma animação movendo a Lua para a posição responsável por gerar o fenômeno da fase escolhida. Para a criação da animação dos botões foi usada a biblioteca Tween.Js. Dessa forma ao selecionar cada fase da lua o jogador pode observar o motivo da existência desses fenômenos de forma interativa movimentando a câmera .



