from modulos.classes import Estoque, Produto

estoque = Estoque()

while True:
    print("\n1 - Adicionar produto")
    print("2 - Listar Estoque")
    print("3 - Pesquisa por nome")
    print("4 - Pesquisa por código")
    print("5 - Atualizar produto")
    print("6 - Remover produto")
    print("0 - Sair \n")

    operacao = input("Escolha a operação desejada: ")

    if operacao == "1":
        nome = input("Nome: ")
        tipo = input("Tipo (1 = Unitário | 2 = Peso): ")

        if tipo == "1":
            tipo = "unitario"
            quantidade = int(input("Quantidade: "))
            preco = float(input("Preço por unidade: "))
            tamanho = "Und."
        elif tipo == "2":
            tipo = "peso"
            quantidade = float(input("Quantidade em KG: "))
            preco = float(input("Preço por KG: "))
            tamanho = "Kg"
        else:
            print("Opção inválida.")

        estoque.adicionar_produto(nome, tamanho, quantidade, preco, tipo)

    elif operacao == "2":
        estoque.listar_produtos()

    elif operacao == "3":
        nome = input("Digite o nome para busca: ")
        resultado = estoque.buscar_por_nome(nome)

        if resultado:
            for produto in resultado:
                id, nome, tamanho, quantidade, preco, tipo = produto

                if tipo == "peso":
                    print(
                        f"[{id}] {nome} ({tamanho}) | {quantidade}kg | R$ {preco:.2f}/kg")
                else:
                    print(
                        f"[{id}] {nome} ({tamanho}) | Qtd: {quantidade} | R$ {preco:.2f}")
        else:
            print("Nenhum produto encontrado.")

    elif operacao == "4":
        codigo = int(input("Digite o código do produto: "))
        produto = estoque.buscar_produto(codigo)

        if produto:
            id, nome, tamanho, quantidade, preco, tipo = produto

            if tipo == "peso":
                print(
                    f"[{id}] {nome} ({tamanho}) | {quantidade}kg | R$ {preco:.2f}/kg")
            else:
                print(
                    f"[{id}] {nome} ({tamanho}) | Qtd: {quantidade} | R$ {preco:.2f}")
        else:
            print("Produto não encontrado.")

    elif operacao == "5":
        codigo = input("Código do produto: ")
        estoque.atualizar_produto(codigo)

    elif operacao == "6":
        codigo = input("Código do produto: ")
        estoque.remover_produto(codigo)

    elif operacao == "0":
        break

    else:
        print("Operação incorreta, tenta novamente.")
