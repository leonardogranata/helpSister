import re

import requests
from requests.exceptions import RequestException


def limpar_cep(cep):
    return re.sub(r"\D", "", cep or "")


def buscar_dados_cep(cep):
    cep_limpo = limpar_cep(cep)

    if len(cep_limpo) != 8:
        return None

    try:
        resposta = requests.get(f"https://viacep.com.br/ws/{cep_limpo}/json/", timeout=5)
        resposta.raise_for_status()
    except RequestException:
        return None

    dados = resposta.json()
    if "erro" in dados:
        return None

    return {
        "cep": dados.get("cep"),
        "logradouro": dados.get("logradouro"),
        "bairro": dados.get("bairro"),
        "cidade": dados.get("localidade"),
        "estado": dados.get("uf"),
    }


def limpar_cpf(cpf):
    return re.sub(r"\D", "", cpf or "")

