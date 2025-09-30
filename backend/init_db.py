
from app import create_app
from models import db, User, Plan, SpiritualMetric, AIConversation, Gamification, Payment

app = create_app()

with app.app_context():
    db.create_all()

    # Exemplo de dados iniciais (seeds)
    if not Plan.query.first():
        free_plan = Plan(name=\'Free\", price=0.0, features=\'Basic access, 1 AI chat per day\')
        premium_plan = Plan(name=\'Premium\", price=9.99, features=\'Full access, unlimited AI chat, advanced metrics\')
        db.session.add(free_plan)
        db.session.add(premium_plan)
        db.session.commit()

    if not User.query.first():
        admin_user = User(username=\'admin\", email=\'admin@ilyra.com\")
        admin_user.set_password(\'admin_password\')
        admin_user.role = \'admin\'
        admin_user.plan = Plan.query.filter_by(name=\'Premium\').first()
        db.session.add(admin_user)
        db.session.commit()

    print("Banco de dados inicializado e dados iniciais inseridos.")

