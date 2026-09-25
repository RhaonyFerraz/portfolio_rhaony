/**
 * ============================================================================
 * Core C Engine - Rhaony Portfolio
 * High-Performance Computation & Particle Physics for WebAssembly
 * ============================================================================
 * 
 * Este módulo em C contém funções matemáticas otimizadas para:
 * 1. Análise Estatística e Ciência de Dados (Média, Desvio Padrão, Covariância)
 * 2. Regressão Linear Simples para Modelagem Preditiva
 * 3. Simulação de Monte Carlo de alta velocidade
 * 4. Dinâmica de Partículas para o Canvas Interativo da UI
 *
 * Compilação para WebAssembly:
 *   emcc core.c -O3 -s WASM=1 -s SIDE_MODULE=1 -o core.wasm
 */

#include <stdint.h>
#include <stddef.h>

#define MAX_PARTICLES 120

// Estrutura de dados para partículas do background interativo
typedef struct {
    float x;
    float y;
    float vx;
    float vy;
    float radius;
    float base_radius;
    float alpha;
    float energy;
} Particle;

// Buffer de partículas gerenciado na memória WASM
static Particle particles[MAX_PARTICLES];
static uint32_t rng_state = 123456789;

/**
 * Gerador de números pseudo-aleatórios rápido (Xorshift32)
 */
uint32_t fast_rand(void) {
    uint32_t x = rng_state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    rng_state = x;
    return x;
}

float fast_rand_float(float min, float max) {
    return min + ((float)(fast_rand() & 0xFFFF) / 65535.0f) * (max - min);
}

/**
 * Inicialização do buffer de partículas em C
 */
void init_particle_system(int count, float width, float height) {
    if (count > MAX_PARTICLES) count = MAX_PARTICLES;
    
    for (int i = 0; i < count; i++) {
        particles[i].x = fast_rand_float(0.0f, width);
        particles[i].y = fast_rand_float(0.0f, height);
        particles[i].vx = fast_rand_float(-0.6f, 0.6f);
        particles[i].vy = fast_rand_float(-0.6f, 0.6f);
        particles[i].base_radius = fast_rand_float(1.5f, 3.5f);
        particles[i].radius = particles[i].base_radius;
        particles[i].alpha = fast_rand_float(0.25f, 0.85f);
        particles[i].energy = 1.0f;
    }
}

/**
 * Atualização física de partículas em C:
 * Aplica velocidades, limites de tela e atração suave pelo cursor do mouse
 */
void update_particle_system(int count, float width, float height, float mouse_x, float mouse_y, float mouse_active) {
    if (count > MAX_PARTICLES) count = MAX_PARTICLES;
    
    for (int i = 0; i < count; i++) {
        // Movimento base
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;

        // Rebote nas bordas
        if (particles[i].x < 0.0f) { particles[i].x = 0.0f; particles[i].vx *= -1.0f; }
        else if (particles[i].x > width) { particles[i].x = width; particles[i].vx *= -1.0f; }

        if (particles[i].y < 0.0f) { particles[i].y = 0.0f; particles[i].vy *= -1.0f; }
        else if (particles[i].y > height) { particles[i].y = height; particles[i].vy *= -1.0f; }

        // Interação com o mouse (se ativo)
        if (mouse_active > 0.5f) {
            float dx = mouse_x - particles[i].x;
            float dy = mouse_y - particles[i].y;
            float dist_sq = dx * dx + dy * dy;
            float max_dist = 140.0f;

            if (dist_sq < max_dist * max_dist && dist_sq > 0.01f) {
                float dist = 0.0f;
                // Raiz quadrada rápida por aproximação
                float xhalf = 0.5f * dist_sq;
                int32_t j;
                union { float f; int32_t i; } conv;
                conv.f = dist_sq;
                conv.i = 0x5f3759df - (conv.i >> 1);
                conv.f = conv.f * (1.5f - xhalf * conv.f * conv.f);
                dist = 1.0f / conv.f;

                float force = (1.0f - dist / max_dist) * 0.45f;
                particles[i].vx += (dx / dist) * force;
                particles[i].vy += (dy / dist) * force;
                particles[i].radius = particles[i].base_radius * 1.8f;
            } else {
                particles[i].radius = particles[i].base_radius;
            }
        }

        // Amortecimento para estabilidade
        particles[i].vx *= 0.992f;
        particles[i].vy *= 0.992f;
    }
}

/**
 * Retorna ponteiro do buffer de partículas para o JavaScript ler direto da memória WASM
 */
const Particle* get_particles_pointer(void) {
    return particles;
}

/* ========================================================================= */
/* ALGORITMOS DE CIÊNCIA DE DADOS EM C                                        */
/* ========================================================================= */

/**
 * Aproximação de raiz quadrada rápida
 */
static float fast_sqrt(float val) {
    if (val <= 0.0f) return 0.0f;
    float x = val;
    for (int i = 0; i < 6; i++) {
        x = 0.5f * (x + val / x);
    }
    return x;
}

/**
 * Cálculo de Média Aritmética
 */
float c_calculate_mean(const float* data, int n) {
    if (n <= 0) return 0.0f;
    double sum = 0.0;
    for (int i = 0; i < n; i++) {
        sum += data[i];
    }
    return (float)(sum / n);
}

/**
 * Cálculo de Desvio Padrão e Variância
 */
float c_calculate_variance(const float* data, int n, float mean) {
    if (n <= 1) return 0.0f;
    double sum_sq_diff = 0.0;
    for (int i = 0; i < n; i++) {
        double diff = (double)data[i] - (double)mean;
        sum_sq_diff += diff * diff;
    }
    return (float)(sum_sq_diff / (n - 1));
}

/**
 * Regressão Linear Simples em C: y = a + b*x
 * Retorna o coeficiente de determinação R²
 */
float c_linear_regression(const float* x, const float* y, int n, float* out_slope, float* out_intercept) {
    if (n < 2) return 0.0f;

    float mean_x = c_calculate_mean(x, n);
    float mean_y = c_calculate_mean(y, n);

    double numerator = 0.0;
    double denom_x = 0.0;
    double denom_y = 0.0;

    for (int i = 0; i < n; i++) {
        double dx = (double)x[i] - (double)mean_x;
        double dy = (double)y[i] - (double)mean_y;
        numerator += dx * dy;
        denom_x += dx * dx;
        denom_y += dy * dy;
    }

    if (denom_x == 0.0) {
        *out_slope = 0.0f;
        *out_intercept = mean_y;
        return 0.0f;
    }

    double slope = numerator / denom_x;
    double intercept = (double)mean_y - slope * (double)mean_x;

    *out_slope = (float)slope;
    *out_intercept = (float)intercept;

    if (denom_y == 0.0) return 1.0f;
    double r = numerator / (fast_sqrt((float)denom_x) * fast_sqrt((float)denom_y));
    return (float)(r * r); // R²
}

/**
 * Simulação de Monte Carlo para estimativa numérica (ex: Pi ou precificação de risco)
 */
float c_monte_carlo_pi(int iterations) {
    if (iterations <= 0) return 0.0f;
    int inside_circle = 0;
    
    for (int i = 0; i < iterations; i++) {
        float x = fast_rand_float(-1.0f, 1.0f);
        float y = fast_rand_float(-1.0f, 1.0f);
        if (x * x + y * y <= 1.0f) {
            inside_circle++;
        }
    }
    
    return 4.0f * ((float)inside_circle / (float)iterations);
}
