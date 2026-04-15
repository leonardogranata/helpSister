import re


def limpar_cpf(cpf):
    return re.sub(r"\D", "", cpf or "")


def validar_cpf(cpf):
    cpf_num = limpar_cpf(cpf)
    if not cpf_num or len(cpf_num) != 11:
        return False
    if cpf_num == cpf_num[0] * 11:
        return False

    soma = 0
    for i in range(1, 10):
        soma += int(cpf_num[i - 1]) * (11 - i)

    resto = (soma * 10) % 11
    if resto == 10 or resto == 11:
        resto = 0
    if resto != int(cpf_num[9]):
        return False

    soma = 0
    for i in range(1, 11):
        soma += int(cpf_num[i - 1]) * (12 - i)

    resto = (soma * 10) % 11
    if resto == 10 or resto == 11:
        resto = 0

    return resto == int(cpf_num[10])
