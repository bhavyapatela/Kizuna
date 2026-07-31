backend/
    app/ (backend work lives here)
        main.py (main entrance of app)
        config.py (prod key structure)
        database.py (bridge to postgreSQL)
        dependencies.py (provides db session, current user, admin user to routes)
    api/
        models/ (represent database tables)
        schemas/ (input/output data format)
        services/ (brain, business logic)
        repositories/ (handle DB)
        security/ (handle auth, JWT, password hashing)
    middleware/ (intercept requests)
    utils/ (reusable helper functions)
    alembic/ (db migrations)
    tests/ (unit tests & integration tests)

requirements.txt
.env
README.md