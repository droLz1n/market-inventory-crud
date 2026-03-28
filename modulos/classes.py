class Produto:

    def __init__(self, nome, tamanho, quantidade, preco, codigo):
        self.nome = nome
        self.tamanho = tamanho
        self.quantidade = quantidade
        self.preco = preco
        self.codigo = codigo

    def __str__(self):
        return f'O produto {self.nome} de {self.tamanho}, de código {self.codigo}, possuí {self.quantidade} unidades e está custando {self.preco:.2f} a unidade.'