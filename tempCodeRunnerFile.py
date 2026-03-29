from modulos.classes import Estoque, Produto

estoque = Estoque()

while True:
    print("\n1 - Adicionar produto")
    print("2 - Listar produtos")
    print("3 - Atualizar produto")
    print("4 - Remover produto")
    print("0 - Sair")

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
        codigo = input("Código do produto: ")
        estoque.atualizar_produto(codigo)

    elif operacao == "4":
        codigo = input("Código do produto: ")
        estoque.remover_produto(codigo)

    elif operacao == "0":
        break
