import os

class Config:
    SECRET_KEY = '123456'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:1234@localhost/pregnancy_tracker'
    SQLALCHEMY_TRACK_MODIFICATIONS = False