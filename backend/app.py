from flask import Flask, request
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import logging
import os
from datetime import datetime 
import json
import random

# Create App
app = Flask(__name__)
api = Api(app,prefix="/api/v1")
CORS(app)

# Arguments for Submission API
submit_args = reqparse.RequestParser()
submit_args.add_argument('name',type=str)
submit_args.add_argument('id',type=int)
submit_args.add_argument('guess',type=str)
submit_args.add_argument('condition',type=str)
submit_args.add_argument('guesses_remaining',type=int)
submit_args.add_argument('hard_mode',type=bool)
submit_args.add_argument('word',type=str)


# Arguments for Get Words API
getwords_args = reqparse.RequestParser()
getwords_args.add_argument('language',type=str)



# Setup Logging
logfile = 'log/wordle-backend.log'
basedir = os.path.dirname(logfile)
if not os.path.exists(basedir):
    os.makedirs(basedir)
open(logfile,'a').close()
logging.basicConfig(filename=logfile, level=logging.DEBUG)

# Setup Results Dir
results_dir = 'results/'
if not os.path.exists(results_dir):
    os.makedirs(results_dir)


class PostSubmit(Resource):
    def post(self):
        app.logger.info("Processing Results")
        args = submit_args.parse_args()
        app.logger.info(args)
        
        curdate = datetime.utcnow().strftime("%d%m%Y")

        results_csv = f"{args.name}_{args.id}_{curdate}.csv"
        with open(results_csv, 'a') as f:
            f.write(args.guess)
      
        return {"Submission from {}".format(args.name):"successful"}


class GetWords(Resource):
    def get(self):
        app.logger.info("Getting Words")
        args = getwords_args.parse_args()
        app.logger.info(args)
        print("Recievd Get Request")

        if args.language not in ['de','en']: 
            return {"Failue, language not recognized": 404}
        else:
            file_suffix = args.language
        
        with open(f'words/words_{file_suffix}.json','r') as f:
            words = json.load(f)

        word = words[random.randint(0,len(words))]
      
        return {'Word': word}


api.add_resource(PostSubmit,'/submit')
api.add_resource(GetWords,'/word')

if __name__ == '__main__':
    app.run(debug=True) 
