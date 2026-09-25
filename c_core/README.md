# Core C Engine - Rhaony Portfolio (WebAssembly)

Este diretório contém a lógica central em **Linguagem C**, compilada para **WebAssembly (WASM)** e executada diretamente no navegador sem necessidade de nenhum servidor de aplicação.

## Arquitetura e Algoritmos em C

O arquivo [`core.c`](file:///c:/Users/Micro/Desktop/portfolio_rhaony/c_core/core.c) implementa:

1. **Simulação Física de Partículas (`Particle Engine`)**:
   - Controle direto de buffers de memória (posições `x, y`, velocidades `vx, vy`, massa, energia e dissipação vetorial).
   - Atração gravitacional por cursor com aproximação de raiz quadrada rápida (*Fast Inverse Square Root*).
   - O JavaScript lê diretamente a memória linear do WebAssembly (`WebAssembly.Memory`), garantindo taxa de quadros estável de 60 FPS com zero alocações por frame de garbage collection.

2. **Cálculos de Ciência de Dados & Modelagem Numérica**:
   - `c_calculate_mean`: Média aritmética de alta precisão acumulada em ponto flutuante de dupla precisão (`double`).
   - `c_calculate_variance`: Variância amostral e desvio padrão.
   - `c_linear_regression`: Ajuste de mínimos quadrados ordinários (OLS) calculando coeficientes angular, linear e $R^2$ de determinação.
   - `c_monte_carlo_pi`: Simulação de Monte Carlo com gerador pseudo-aleatório `Xorshift32` para estimativa probabilística e benchmark de computação intensa.

## Como compilar para WebAssembly

### Opção 1: Via Emscripten (Recomendado)
```bash
emcc core.c -O3 -s WASM=1 -s SIDE_MODULE=1 \
    -s EXPORTED_FUNCTIONS="['_init_particle_system','_update_particle_system','_get_particles_pointer','_c_calculate_mean','_c_calculate_variance','_c_linear_regression','_c_monte_carlo_pi']" \
    -o ../js/core.wasm
```

### Opção 2: Via Clang Nativo
```bash
clang --target=wasm32 -O3 -nostdlib -Wl,--no-entry -Wl,--export-all -o ../js/core.wasm core.c
```

### Execução no Navegador
O portfólio já inclui um decodificador binário autônomo em JavaScript (`js/wasm_engine.js`) que instancia o WebAssembly nativo instantaneamente, garantindo compatibilidade total com o **GitHub Pages** (mesmo em redes que bloqueiam arquivos `.wasm` por MIME type).
