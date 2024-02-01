$(function(){
    cardapio.metodos.obterItensCardapio();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;
var MEU_PGTO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 0;

cardapio.eventos = {
    init() {
        cardapio.metodos.obterItensCardapio()

    }
};

cardapio.metodos = {

    // Obtém a lista de itens do cardápio
    obterItensCardapio(categoria =  'burgers', vermais = false) {

        var filtro = MENU[categoria];

        if(!vermais) {
            $("#itensCardapio").html('');
            $('#btnVerMais').removeClass('hidden')
        }


        $.each(filtro, (i, e) => {
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
            .replace(/\${id}/g, e.id)

            //botao ver mais foi clicado (12 itens)
            if(vermais && i >=8 && i < 12) {
                $("#itensCardapio").append(temp)
            }

            //paginação inicial (8itens)
            if(!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }

        })

        //remove o ativo
        $(".container-menu a").removeClass('active')

        //seta o menu ativo
        $("#menu-" + categoria).addClass('active');

    },

    //clique no botao ver mais
    verMais(){

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];

        cardapio.metodos.obterItensCardapio(ativo, true)

        $('#btnVerMais').addClass('hidden');

    },

    //diminui a quantidade do item no cardápio
    diminuirQuantidade(id){
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }
    },

    //Aumenta a quantidade do item no cardápio
    aumentarQuantidade(id){
        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)
    },

    //Adiciona ao carrinho o item do cardápio
    adicionarAoCarrinho(id){

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0){
            //obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            //obtem a lista de itens
            let filtro = MENU[categoria];

            // obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id });

            if(item.length > 0) {


                //valida se já existe este item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id });

                // caso já exista no carrinho, só altera a quantidade
                if(existe.length > 0){
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd += qntdAtual
                }
                //caso não exista o item no carrinho, adiciona ele
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])
                }

                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green');
                $("#qntd-" + id).text(0)
                cardapio.metodos.atualizarBedgeTotal();                
            }

        }

    },

    //atualiza o badge de totais de carrinho
    atualizarBedgeTotal() {
        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if(total > 0) {
            $('.botao-carrinho').removeClass('hidden');
            $('.container-total-carrinho').removeClass('hidden');
        } else {
            $('.botao-carrinho').addClass('hidden');
            $('.container-total-carrinho').addClass('hidden');
        }

        $('.badge-total-carrinho').html(total);
    },

    //Abrir a modal de carrinho
    abrirCarrinho(abrir) {
        if(abrir){
            $("#modalCarrinho").removeClass("hidden");
            cardapio.metodos.carregarCarrinho(1);
        } else{
            $("#modalCarrinho").addClass("hidden");
        }
    },

    //altera os textos e exibe os botoes das etapas
    carregarEtapa(etapa) {

        if(etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:');

            $("#itensCarrinho").removeClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");

            $("#btnEtapaPedido").removeClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").addClass("hidden");

        } else if(etapa == 2){ 
            $("#lblTituloEtapa").text('Endereço e entrega:');

            $("#itensCarrinho").addClass("hidden");
            $("#localEntrega").removeClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaEndereco").removeClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").removeClass("hidden");
        } else if( etapa == 3){
            $("#lblTituloEtapa").text('Resumo do pedido:');

            $("#itensCarrinho").addClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").removeClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");
            $(".etapa3").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").removeClass("hidden");
            $("#btnVoltar").removeClass("hidden");
        }
    },

    //botao de voltar etapa
    voltarEtapa() {
        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa-1);
    },

    //carrega a lista de itens do carrinho
    carregarCarrinho(){
        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0){
            $('#itensCarrinho').html('')
            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho
                .replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)
                $('#itensCarrinho').append(temp);

                if(i + 1 == MEU_CARRINHO.length){
                    cardapio.metodos.carregarValores()
                }
            });
        } else {
            cardapio.metodos.carregarValores()
            $('#itensCarrinho').html('')
            $('#itensCarrinho').append(`<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i>Seu carrinho está vazio :(</p>`);
        }
    },

    //diminui a quantidade do item no carrinho
    diminuirQuantidadeCarrinho(id){
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        
        if(qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1)
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        } else {
            cardapio.metodos.removerItemCarrinho(id);
        }
    },

    //aumenta a quantidade do item no carrinho
    aumentarQuantidadeCarrinho(id){
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1)
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
    },

    //botao remover item do carrinho
    removerItemCarrinho(id){
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id} );

        cardapio.metodos.carregarCarrinho();
        cardapio.metodos.atualizarBedgeTotal();
    },  

    //atualiza o carrinho com a quantidade atual
    atualizarCarrinho(id, qntd) {
        let objIndex = MEU_CARRINHO.findIndex((obj) => {return obj.id == id});
        MEU_CARRINHO[objIndex].qntd = qntd

        //atualiza o botao carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBedgeTotal(qntd);
        //carrega os itens do carrinho
        cardapio.metodos.carregarValores();
    },

    //Carrega os valores de subtotal e entraga
    carregarValores() {

        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text(`R$ 0,00`);
        $("#lblValorEntrega").text(`R$ 0,00`);
        $("#lblValorTotal").text(`R$ 0,00`);

        $.each(MEU_CARRINHO, (i, e) => {
            VALOR_CARRINHO += parseFloat(e.price * e.qntd);
            if (i + 1 == MEU_CARRINHO.length) {
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.',',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.',',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}`);
            }
        })
    },

    //carregar a etapa enderecos
    carregarEndereco() {
        if(MEU_CARRINHO.length <= 0){
            cardapio.metodos.mensagem("Seu carrinho está vazio :(")
            return;
        } else {
            cardapio.metodos.carregarEtapa(2);
        }
    },


    //api viaCep
    buscarCep(){

        //cria a variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        //verifica se o cep possui valor informado
        if(cep != ''){

            //expressao regular para validar o CEP
            var validaCep = /^[0-9]{8}$/;

            if(validaCep.test(cep)){

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados){
                    if (!('erro' in dados)) {
                        //atualizar os campos com os valores returnados
                        $("#txtCidade").val(dados.localidade);
                        $("#txtUf").val(dados.uf);

                        $("#txtEndereco").focus();

                    } else {
                        cardapio.metodos.mensagem("CEP não encontrado. Preencha as informações manualmente.");
                        $("#txtEndereco").focus();
                    }
                })

            }else{
                cardapio.metodos.mensagem("Formato do CEP inválido!");
                $("#txtCEP").focus();
            }

        } else{
            cardapio.metodos.mensagem("Informe o CEP, por favor.");
            $("#txtCEP").focus();
        }

        if(cep == '11920000'){
            cardapio.metodos.atualizaBairro('iguape')
        } else if (cep == '11925000'){
            cardapio.metodos.atualizaBairro('ilha')
        } else {
            cardapio.metodos.mensagem("Infelizmente, não atendemos este CEP");
            return;
        }
    },

    //Validção antes de prosseguir para a etapa 3
    resumoPedido() {

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let numero = $("#txtNumero").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let complemento = $("#txtComplemento").val().trim();
        let uf = $("#txtUf").val().trim();
        let metodopgto = $("#selectMetodo").val().trim();
        let troco = $("#txtTroco").val().trim();

        if(cep.length <= 0){
            cardapio.metodos.mensagem("Informe o CEP, por favor.");
            $("#txtCEP").focus();
            return;
        }

        if(endereco.length <= 0){
            cardapio.metodos.mensagem("Informe o endereço, por favor.");
            $("#txtEndereco").focus();
            return;
        }

        if(numero.length <= 0){
            cardapio.metodos.mensagem("Informe o número, por favor.");
            $("#txtNumero").focus();
            return;
        }

        if(bairro == '-1'){
            cardapio.metodos.mensagem("Informe o bairro, por favor.");
            $("#txtBairro").focus();
            return;
        }

        if(cidade.length <= 0){
            cardapio.metodos.mensagem("Informe a cidade, por favor.");
            $("#txtCidade").focus();
            return;
        }

        if(uf == '-1'){
            cardapio.metodos.mensagem("Informe a UF, por favor.");
            $("#txtUf").focus();
            return;
        }

        if(metodopgto == '-1'){
            cardapio.metodos.mensagem("Informe o metodo de pagamento, por favor.");
            $("#selectMetodo").focus();
            return;
        }

        if(metodopgto == 'dinheiro' && troco.length <= 0){
            cardapio.metodos.mensagem("Informe o troco, por favor.");
            $("#txtTroco").focus();
            return;
        }

        if(metodopgto == 'dinheiro' && troco < (VALOR_CARRINHO + VALOR_ENTREGA)){
            cardapio.metodos.mensagem("O troco deve ser maio que o valor do pedido.");
            return;
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            numero: numero,
            bairro: bairro,
            cidade: cidade,
            complemento: complemento,
            uf: uf,
        };

        MEU_PGTO = {
            metodopgto: metodopgto,
            troco: troco,
        };

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();
    },

    //carrega a etapa de resumo do pedido
    carregarResumo() {
        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {
            let temp = cardapio.templates.itemResumo
                .replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${qntd}/g, e.qntd);

            $("#listaItensResumo").append(temp);
        })

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);
    },

    checaFormaPgto(){
        let formaPgto = $("#selectMetodo").val();
        if(formaPgto == 'dinheiro'){
            $("#inputTroco").removeClass('hidden');
        } else {
            $("#inputTroco").addClass('hidden');
            MEU_PGTO.troco = '';
            $("#txtTroco").val('');
        }
    },

    atualizaEntrega() {
        let cidade = $("#txtCidade").val().toLowerCase().split(' ')[0];
        let bairro = $("#txtBairro").val();

        VALOR_ENTREGA = TAXAS[cidade][bairro];

        cardapio.metodos.carregarValores();
    },

    atualizaBairro(local){
        if(local == 'iguape'){
            $("#txtBairro").html(`
                <option value="-1" selected>Selecione seu bairro</option>
                <option value="centro">Centro</option>
                <option value="chacaraPatricia">Chacara Patrícia</option>
                <option value="guaricana">Guaricana</option>
                <option value="portoRibeira">Porto do Ribeira</option>
                <option value="rocio">Rocio</option>
                <option value="vilaGarces">Vila Garces</option>
                <option value="vilaSapo">Vila Sapo</option>
            `)
        } else if (local == 'ilha') {
            $("#txtBairro").html(`
                <option value="-1" selected>Selecione seu bairro</option>
                <option value="balnAdriana">BALN Adriana</option>
                <option value="balnAtlantico">BALN Atlantico</option>
                <option value="balnBritania">BALN Britânia</option>
                <option value="balnIcarai">BALN Icarai</option>
                <option value="balnIguape">BALN Iguape</option>
                <option value="balnKennedy">BALN Kennedy</option>
                <option value="balnMareSol">BALN Mar e Sol</option>
                <option value="balnMarcia">BALN Marcia</option>
                <option value="balnMariaDeLurdes">BALN Maria de Lurdes</option>
                <option value="balnMarusca">BALN Marusca</option>
                <option value="balnMeuRecanto">BALN Meu Recanto</option>
                <option value="balnMonteCarlo">BALN Monte Carlo</option>
                <option value="balnPortoVelho">BALN Porto Velho</option>
                <option value="balnPortoVelho2">BALN Porto Velho 2</option>
                <option value="balnRedentor">BALN Redentor</option>
                <option value="balnSambura">BALN Samburá</option>
                <option value="balnSaoMartinho">BALN São Martinho</option>
                <option value="balnSarnambi">BALN Sarnambi</option>
                <option value="balnSulmar">BALN Sulmar</option>
                <option value="balnYemar">BALN Yemar</option>
            `)
        }
    },

    mensagem(text, cor = 'red', tempo = 3500) {

        let id = Math.floor(Date.now() * Math.random().toString())

        let msg = `<div id="msg-${id}" class="animate__animated animate__fadeInDown toast ${cor}">${text}</div>`;
        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('animate__fadeInDown');
            $("#msg-" + id).addClass('animate__fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            },800);
        }, tempo)

    },
};

cardapio.templates = {
    item: `
    <div class="col-3 mb-5">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}" alt="">
            </div>
            <p class="bold title-produto text-center mt-4">
                \${name}
            </p>
            <p class="price-produto text-center bold">
                R$ \${price}
            </p>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}">0</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
            </div>
        </div>
    </div>
    `,

    itemCarrinho: `
    <div class="col-12 item-carrinho">
        <div class="img-produto">
            <img src="\${img}">
        </div>
        <div class="dados-produto">
            <p class="title-produto bold">\${name}</p>
            <p class="price-produto bold">R$ \${price}</p>
        </div>
        <div class="add-carrinho">
            <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
            <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
            <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
            <span class="btn btn-remove" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
        </div>
    </div>
    `,

    itemResumo: `
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}" alt="foto produto">
        </div>
        <div class="dados-produto">
            <p class="bold title-produto-resumo">\${name}</p>
            <p class="bold price-produto-resumo">R$ \${price}</p>
        </div>
        <p class="quantidade-produto-resumo">x <span class="bold">\${qntd}</span></p>
    </div>
    `

};

