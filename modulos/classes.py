import psycopg2
class Produto:

    def __init__(self, nome, tamanho, quantidade, preco, tipo):
        self.nome = nome
        self.tamanho = tamanho
        self.quantidade = quantidade
        self.preco = preco
        self.tipo = tipo  # unitario ou por peso

    def __str__(self):
        if self.tipo == "peso":
            return f"[{id}]  {self.nome} ({self.tamanho}) | {self.quantidade}kg | R$ {self.preco:.2f}/kg"
        else:
            return f"[{id}]  {self.nome} ({self.tamanho}) | Qtd: {self.quantidade} | R$ {self.preco:.2f}"


class Estoque:

    def __init__(self):
        self.conn = psycopg2.connect(
            dbname="market_inventory",
            user="postgres",
            password="9999",
            host="localhost",
            port="5432"
        )
        self.cursor = self.conn.cursor()

    def adicionar_produto(self, nome, tamanho, quantidade, preco, tipo):

        self.cursor.execute("""
                INSERT INTO produtos (nome, tamanho, quantidade, preco, tipo)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id;
            """, (nome, tamanho, quantidade, preco, tipo))

        id_gerado = self.cursor.fetchone()[0]
        self.conn.commit()

        print(f"Produto cadastrado com código: {id_gerado}")

    def listar_produtos(self):
        self.cursor.execute(
            "SELECT id, nome, tamanho, quantidade, preco, tipo FROM produtos")
        produtos = self.cursor.fetchall()

        if not produtos:
            print("Estoque Vazio.")
            return

        for produto in produtos:
            id, nome, tamanho, quantidade, preco, tipo = produto

            if tipo == "peso":
                print(
                    f"[{id}] {nome} ({tamanho}) | {quantidade}kg | R$ {preco:.2f}/kg")
            else:
                print(
                    f"[{id}] {nome} ({tamanho}) | Qtd: {quantidade} | R$ {preco:.2f}")

    def buscar_produto(self, codigo):
        self.cursor.execute("SELECT * FROM produtos WHERE id = %s", (codigo,))
        return self.cursor.fetchone()

    def atualizar_produto(self, codigo):

        produto = self.buscar_produto(codigo)

        if not produto:
            print("Produto não encontrado.")
            return

        print("\nDigite os novos valores: ")

        quantidade = int(input("Nova quantidade: "))
        preco = float(input("Novo preço: "))

        self.cursor.execute("""
            UPDATE produtos
            SET quantidade = %s, preco = %s
            WHERE id = %s
            """, (quantidade, preco, codigo))

        self.conn.commit()

        print("Produto atualizado com sucesso!")

    def remover_produto(self, codigo):
        self.cursor.execute("DELETE FROM produtos WHERE id = %s", (codigo,))
        self.conn.commit()

        print("Produto removido com sucesso!")

    def buscar_por_nome(self, nome):
        nome = f"{nome}%"

        self.cursor.execute("""
            SELECT id, nome, tamanho, quantidade, preco, tipo
            FROM produtos
            WHERE unaccent(nome) ILIKE unaccent(%s)
        """, (nome,))

        return self.cursor.fetchall()
