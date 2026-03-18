# Help Sister

Plataforma para conectar contratantes e cuidadoras.

## Requisitos

- Python 3.12+
- Git

## 1) Clonar o repositorio

```bash
git clone <URL_DO_REPOSITORIO>
cd helpSister
```

## 2) Criar e ativar ambiente virtual

Windows (PowerShell):

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3) Instalar dependencias

```bash
pip install -r requirements.txt
```

## 4) Banco de dados (migracoes)

```bash
python manage.py makemigrations
python manage.py migrate
```

Observacao:
- `db.sqlite3` e local e nao deve subir para o GitHub.

## 5) Superusuario (opcional)

```bash
python manage.py createsuperuser
```

Depois acesse:
- `http://127.0.0.1:8000/admin/`

## 6) Rodar o projeto

```bash
python manage.py runserver
```

Acesse:
- `http://127.0.0.1:8000/`

## Upload de imagens (pasta media)

O projeto usa:
- `MEDIA_URL = /media/`
- `MEDIA_ROOT = media/`
- Fotos de perfil em `media/profile_images/`

Voce pode criar manualmente, se quiser:

```bash
mkdir -p media/profile_images
```

No Windows PowerShell:

```powershell
New-Item -ItemType Directory -Path media\profile_images -Force
```

Se a pasta nao existir, o Django normalmente cria no primeiro upload.

## Estrutura (resumo)

- `core`: fluxo geral, landing e redirecionamento de dashboard
- `accounts`: usuario, login/logout e cadastro
- `profiles`: dados especificos por tipo de usuario

## Dicas rapidas

- Sempre rode `python manage.py migrate` ao baixar novas alteracoes.
- Em desenvolvimento, mantenha `DEBUG=True`.
- Nao comite `.env`, `venv/`, `db.sqlite3` e `media/`.
