import os
import re
import sys
import subprocess
import site

def load_env():
    # Load .env manually if it exists to avoid dependency issues before pip install
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    parts = line.split('=', 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        val = parts[1].strip().strip('"').strip("'")
                        os.environ[key] = val
    os.environ.setdefault("DATABASE_URL", "file:./dev.db")

def setup_database():
    load_env()
    
    # Add virtual environment Scripts folder to PATH so prisma can find prisma-client-py
    scripts_dirs = [os.path.dirname(sys.executable)]
    user_base = site.getuserbase()
    if user_base:
        scripts_dirs.append(os.path.join(user_base, f"Python{sys.version_info.major}{sys.version_info.minor}", "Scripts"))
        scripts_dirs.append(os.path.join(user_base, "Scripts"))
    os.environ["PATH"] = os.pathsep.join(scripts_dirs) + os.pathsep + os.environ.get("PATH", "")
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable is not set.", file=sys.stderr)
        print("Please create a .env file or set DATABASE_URL.", file=sys.stderr)
        sys.exit(1)
        
    print(f"DATABASE_URL is: {db_url}")
    
    schema_path = os.path.join(os.path.dirname(__file__), 'models', 'schema.prisma')
    if not os.path.exists(schema_path):
        print(f"Error: Prisma schema not found at {schema_path}", file=sys.stderr)
        sys.exit(1)
        
    with open(schema_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    is_sqlite = db_url.startswith("file:") or db_url.startswith("sqlite:") or "dev.db" in db_url
    
    # 1. Update datasource provider
    if is_sqlite:
        print("Configuring Prisma schema for SQLite local fallback...")
        content = re.sub(r'provider\s*=\s*"postgresql"', 'provider = "sqlite"', content)
        # SQLite does not support scalar lists (String[]), replace it with String
        content = re.sub(r'tags\s*String\[\]', 'tags String', content)
        content = re.sub(r'topics\s*String\[\]', 'topics String', content)
    else:
        print("Configuring Prisma schema for PostgreSQL...")
        content = re.sub(r'provider\s*=\s*"sqlite"', 'provider = "postgresql"', content)
        # Restore String[] for PostgreSQL
        content = re.sub(r'tags\s*String(?!\s*@|\[\])', 'tags String[]', content)
        content = re.sub(r'topics\s*String(?!\s*@|\[\])', 'topics String[]', content)
        
    with open(schema_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Prisma schema updated. Running prisma db push and generate...")
    
    prisma_cmd = [sys.executable, "-m", "prisma"]
    print(f"Using prisma command: {' '.join(prisma_cmd)}")
    
    # Run prisma db push
    push_res = subprocess.run([*prisma_cmd, "db", "push", f"--schema={schema_path}"])
    if push_res.returncode != 0:
        print("Error: prisma db push failed.", file=sys.stderr)
        sys.exit(push_res.returncode)
        
    # Run prisma generate
    gen_res = subprocess.run([*prisma_cmd, "generate", f"--schema={schema_path}"])
    if gen_res.returncode != 0:
        print("Error: prisma generate failed.", file=sys.stderr)
        sys.exit(gen_res.returncode)
        
    print("Database setup completed successfully!")

if __name__ == "__main__":
    setup_database()
