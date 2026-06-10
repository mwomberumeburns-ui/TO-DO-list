from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from database import DB_HOST, DB_NAME, DB_PORT, DB_USER, SessionLocal


def main():
    print(f"Testing MySQL connection to {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    try:
        with SessionLocal() as db:
            result = db.execute(text("SELECT 1")).scalar()
    except OperationalError as exc:
        print("Database connection failed.")
        print(exc.orig)
        raise SystemExit(1) from exc

    print(f"Database connected successfully. SELECT 1 returned {result}.")


if __name__ == "__main__":
    main()
