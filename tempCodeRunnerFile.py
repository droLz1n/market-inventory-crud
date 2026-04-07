    elif operacao == "3":
        nome = input("Digite o nome para busca: ")
        resultado = estoque.buscar_por_nome(nome)

        if resultado:
            for produto in resultado:
                id, nome, tamanho, quantidade, preco, tipo = produto

                if tipo == "peso":
                    print(f"[{id}] {nome} ({tamanho}) | {quantidade}kg | R$ {preco:.2f}/kg")
                else:
                    print(f"[{id}] {nome} ({tamanho}) | Qtd: {quantidade} | R$ {preco:.2f}")
        else:
            print("Nenhum produto encontrado.")