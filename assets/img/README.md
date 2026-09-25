# Instruções para Inserção de Fotos e Ativos

Coloque sua foto profissional neste diretório:

1. **Foto de Perfil do Portfólio**:
   - Salve sua foto com o nome: `perfil.jpg` ou `perfil.png`
   - Formato recomendado: Proporção 4:5 ou 1:1 (Ex: 800x1000 pixels ou 800x800 pixels).
   - Para aplicar no site, abra o arquivo `index.html` e na tag `<div class="portrait-placeholder" id="portrait-frame">`, substitua pelo seguinte código:
   ```html
   <img src="assets/img/perfil.jpg" alt="Rhaony" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">
   ```

2. **Currículo (CV)**:
   - Você também pode adicionar seu currículo em PDF aqui como `curriculo.pdf` e vincular no botão de download se desejar.
