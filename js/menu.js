/* =====================================================================
   MENU PRINCIPAL COMPARTILHADO — Atlas Indígena PR

   Para usar em qualquer página (na mesma pasta do index.html):
     <link rel="stylesheet" href="menu.css">   → dentro do <head>
     <script src="menu.js"></script>            → logo depois de <body>

   Para mudar ou acrescentar itens, edite só a lista ITENS abaixo:
   a alteração vale para o site inteiro.
   ===================================================================== */
(function () {

    // Texto do menu + id da seção correspondente dentro do index.html
    const ITENS = [
        { texto: 'Início',    secao: 'capa' },
        { texto: 'Conteúdos', secao: 'conteudos' },
        { texto: 'postagens', secao: 'insta-section' },
        { texto: 'O Projeto', secao: 'sobre' }
    ];
    const LOGO = 'Fotos/atlas_pr_cortada.jpg';

    // Em que página estamos?
    const arquivo    = location.pathname.split('/').pop().toLowerCase();
    const naIndex    = ['', 'index', 'index.html'].includes(arquivo);
    const emConteudo = arquivo.startsWith('conteudo_');   // conteudo_mapas.html, conteudo_fotos.html...

    // Na index o link só rola até a seção (#capa);
    // nas outras páginas ele leva de volta para a index (index.html#capa).
    const prefixo = naIndex ? '' : 'index.html';

    function montarMenu() {
        const links = ITENS.map(item => {
            // nas páginas conteudo_*.html o item "Conteúdos" fica destacado
            const ativo = (emConteudo && item.secao === 'conteudos') ? ' ativo' : '';
            return `<a href="${prefixo}#${item.secao}" class="nav-link${ativo}" data-secao="${item.secao}">${item.texto}</a>`;
        }).join('\n    ');

        document.body.insertAdjacentHTML('afterbegin', `
<nav id="menu-principal">
    <img src="${LOGO}" class="nav-logo" alt="Logo">
    ${links}
    <a href="mapa.html" class="btn-nav-mapa">Abrir Mapa</a>
</nav>`);

        const menu = document.getElementById('menu-principal');
        if (naIndex) destacarAoRolar(menu);
        else reservarEspaco(menu);
    }

    // Fora da index: o menu é "fixed" e não ocupa espaço,
    // então um espaçador empurra o conteúdo da página para baixo dele.
    function reservarEspaco(menu) {
        const espaco = document.createElement('div');
        menu.insertAdjacentElement('afterend', espaco);
        const ajustar = () => { espaco.style.height = menu.offsetHeight + 'px'; };
        ajustar();
        if ('ResizeObserver' in window) new ResizeObserver(ajustar).observe(menu);
        else window.addEventListener('resize', ajustar);
    }

    // Na index: destaca o item da seção visível (mesma regra do código original)
    function destacarAoRolar(menu) {
        const links = menu.querySelectorAll('.nav-link');
        const atualizar = () => {
            let atual = '';
            document.querySelectorAll('section[id]').forEach(secao => {
                if (window.scrollY >= secao.offsetTop - secao.clientHeight / 4) atual = secao.id;
            });
            links.forEach(l => l.classList.toggle('ativo', l.dataset.secao === atual));
        };
        ['scroll', 'resize', 'DOMContentLoaded', 'load'].forEach(ev =>
            window.addEventListener(ev, atualizar, { passive: true }));
        atualizar();
    }

    // Funciona mesmo se o script for colocado no <head>
    if (document.body) montarMenu();
    else document.addEventListener('DOMContentLoaded', montarMenu);

})();
