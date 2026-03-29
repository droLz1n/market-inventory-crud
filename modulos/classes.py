class Produto:

    def __init__(self, nome, tamanho, quantidade, preco, codigo):
        self.nome = nome
        self.tamanho = tamanho
        self.quantidade = quantidade
        self.preco = preco
        self.codigo = codigo

    def __str__(self):
        return f'O produto {self.nome} de {self.tamanho}, de código {self.codigo}, possuí {self.quantidade} unidades e está custando {self.preco:.2f} a unidade.'


class Estoque:

    def __init__(self):
        self.produtos = []
        self.contador_codigo = 1

    def adicionar_produto(self, nome, tamanho, quantidade, preco):
        codigo = self.gerar_codigo()

        produto = Produto(nome, tamanho, quantidade, preco, codigo)
        self.produtos.append(produto)

        print(f"Produto cadastrado com código: {codigo}")

    def listar_produtos(self):
        if not self.produtos:
            print("Estoque vazio.")
            return
        for produto in self.produtos:
            print(produto)

    def buscar_produto(self, codigo):
        for produto in self.produtos:
            if produto.codigo == codigo:
                return produto
        return None

    def atualizar_produto(self, codigo):
        produtos = self.buscar_produto(codigo)

        if produtos:
            produtos.quantidade = int(input("Nova quantidade: "))
            produtos.preco = float(input("Nova preço: "))
        else:
            print("Produto não encontrado.")

    def remover_produto(self, codigo):
        produtos = self.buscar_produto(codigo)

        if produtos:
            self.produtos.remove(produtos)
            print("Produto removido.")
        else:
            print("Produto não encontrado.")

    def gerar_codigo(self):
        if self.contador_codigo > 99999:
            raise ValueError("Limite de códigos atingido(99999).")

        codigo = f"{self.contador_codigo:05d}"
        self.contador_codigo += 1
        return codigo
