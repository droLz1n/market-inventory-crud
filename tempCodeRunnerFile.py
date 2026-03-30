from modulos.classes import Estoque, Produto

estoque = Estoque()
estoque.carregar_dados()

while True:
    print("\n1 - Adicionar produto")
    print("2 - Listar Estoque")
    print("3 - Pesquisa por nome")
    print("4 - Atualizar produto")
    print("5 - Remover produto")
    print("0 - Sair \n")

    operacao = input("Escolha a operação desejada: ")

    if operacao == "1":
        nome = input("Nome: ")
        tamanho = input("Tamanho: ")
        quantidade = int(input("Quantidade: "))
        preco = float(input("Preço: "))

        estoque.adicionar_produto(nome, tamanho, quantidade, preco)

    elif operacao == "2":
        estoque.listar_produtos()

    elif operacao == "3":
        nome = input("Digite o nome para busca: ")
        resultado = estoque.buscar_por_nome(nome)

        if resultado:
            for produto in resultado:
                print(produto)
        else:
            print("Nenhum produto encontrado.")

    elif operacao == "4":
        codigo = input("Código do produto: ")
        estoque.atualizar_produto(codigo)

    elif operacao == "5":
        codigo = input("Código do produto: ")
        estoque.remover_produto(codigo)

    elif operacao == "0":
        break
