import json
import unicodedata


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

        self.salvar_dados()

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
        produto = self.buscar_produto(codigo)

        if produto:
            print("\nProduto encontrado:")
            print(f"Nome: {produto.nome}")
            print(f"Tamanho: {produto.tamanho}")
            print(f"Quantidade: {produto.quantidade}")
            print(f"Preço: R$ {produto.preco:.2f}")

            confirmar = input("\nDeseja atualizar este produto? (s/n): ")

            if confirmar.lower() != "s":
                print("Operação cancelada.")
                return

            print("\nDigite os novos valores (ou pressione ENTER para manter):")

            produto.quantidade = int(input("Nova quantidade: "))
            produto.preco = float(input("Nova preço: "))

            self.salvar_dados()
        else:
            print("Produto não encontrado.")

    def remover_produto(self, codigo):
        produtos = self.buscar_produto(codigo)

        if produtos:
            self.produtos.remove(produtos)
            self.salvar_dados()
            print("Produto removido.")
        else:
            print("Produto não encontrado.")

    def gerar_codigo(self):
        if self.contador_codigo > 99999:
            raise ValueError("Limite de códigos atingido(99999).")

        codigo = f"{self.contador_codigo:05d}"
        self.contador_codigo += 1
        return codigo

    def salvar_dados(self):
        dados = []
        for produto in self.produtos:
            dados.append({
                "nome": produto.nome,
                "tamanho": produto.tamanho,
                "quantidade": produto.quantidade,
                "preco": produto.preco,
                "codigo": produto.codigo
            })

        with open("database.json", "w", encoding="utf-8") as arquivo:
            json.dump(dados, arquivo, indent=4)

    def carregar_dados(self):
        try:
            with open("database.json", "r", encoding="utf-8") as arquivo:
                dados = json.load(arquivo)
                for item in dados:
                    produto = Produto(
                        item["nome"],
                        item["tamanho"],
                        item["quantidade"],
                        item["preco"],
                        item["codigo"]
                    )
                    self.produtos.append(produto)

                self.atualizar_contador()
        except FileNotFoundError:
            print("Arquivo JSON não encontrado.")

    def atualizar_contador(self):
        if not self.produtos:
            self.contador_codigo = 1
        else:
            maior = max(int(produto.codigo) for produto in self.produtos)
            self.contador_codigo = maior + 1

    def buscar_por_nome(self, nome_busca):
        resultados = []
        nome_busca = self.normalizar(nome_busca)

        for produto in self.produtos:
            if nome_busca in self.normalizar(produto.nome):
                resultados.append(produto)
        return resultados

    def normalizar(self, texto):
        return unicodedata.normalize("NFKD", texto)\
            .encode("ASCII", "ignore")\
            .decode("ASCII")\
            .lower()\
            .strip()
