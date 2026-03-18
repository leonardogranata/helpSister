import re
import requests
from validate_docbr import CPF

def limpar_cep(cep):
    return re.sub(r'\D', '', cep or '')

def buscar_dados_cep(cep):
    cep_limpo = limpar_cep(cep)
    
    if len(cep_limpo) != 8:
        return None
    
    resposta = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/', timeout=5)

    if resposta.status_code == 200:
        dados = resposta.json()
        if 'erro' not in dados:
            return {
                'cep': dados.get('cep'),
                'logradouro': dados.get('logradouro'),
                'bairro': dados.get('bairro'),
                'cidade': dados.get('localidade'),
                'estado': dados.get('uf')
            }

print ("CEP:", buscar_dados_cep('15013-290')['cep'])     
print ("LOGRADOURO:", buscar_dados_cep('15013-290')['logradouro'])
print ("BAIRRO:", buscar_dados_cep('15013-290')['bairro'])
print ("CIDADE:", buscar_dados_cep('15013-290')['cidade'])
print ("ESTADO:", buscar_dados_cep('15013-290')['estado'])

def limpar_cpf(cpf):
    return re.sub(r'\D', '', cpf or '')

def validar_cpf(cpf):
    cpf_limpo = limpar_cpf(cpf)
    validador = CPF()
    return validador.validate(cpf_limpo)

print("CPF Válido:", validar_cpf('694.591.580-80'))