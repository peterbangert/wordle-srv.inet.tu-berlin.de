from flask import Flask, jsonify, request
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
# submit_args = reqparse.RequestParser()
# submit_args.add_argument('name',type=str)
# submit_args.add_argument('id',type=int)
# submit_args.add_argument('guess',type=str)
# submit_args.add_argument('condition',type=str)
# submit_args.add_argument('guesses_remaining',type=int)
# submit_args.add_argument('hard_mode',type=bool)
# submit_args.add_argument('word',type=str)
# submit_args.add_argument('confidence_level',type=int)
results_header = "name,id,condition,word,guess,guesses_remaining,confidence_level,hard_mode"


# Arguments for Get Words API
# getwords_args = reqparse.RequestParser()
# getwords_args.add_argument('language')



# Setup Logging
logfile = 'log/wordle_backend.log'
basedir = os.path.dirname(logfile)
if not os.path.exists(basedir):
    os.makedirs(basedir)
open(logfile,'a').close()
logging.basicConfig(filename=logfile, level=logging.DEBUG, format="%(asctime)s %(name)s %(levelname)s %(message)s")


# Setup Results Dir
curdate = datetime.utcnow().strftime("%d%m%Y")
results_dir = f'results/{curdate}'
if not os.path.exists(results_dir):
    os.makedirs(results_dir)


class PostSubmit(Resource):
    def post(self):
        app.logger.info("Processing Results")
        # args = submit_args.parse_args()
        # app.logger.info(args)
        args = ''
        json_data = request.get_json(force=True)
        app.logger.info(json_data)
        
        results_csv = f"{results_dir}/{args.name}_{args.id}.csv"

        if not os.path.isfile(results_csv): 
            with open(results_csv, 'a') as f:    
                f.write(results_header)

        with open(results_csv, 'a') as f:
            f.write(f"{args.name},\
                    {args.id},\
                    {args.condition},\
                    {args.word},\
                    {args.guess},\
                    {args.guesses_remaining},\
                    {args.confidence_level},\
                    {args.hard_mode}")
      
        app.logger.info(f"Submission from {args.name},{args.id}: successful")
        return {f"Submission from {args.name},{args.id}: successful"}


class GetWord(Resource):
    def get(self):
        app.logger.info("Getting Word")

        app.logger.info(request)
        # args = getwords_args.parse_args()
        # app.logger.info(args)
        json_data = request.get_json(force=True)
        app.logger.info(json_data)
        args = ''

        if args.language not in ['de','en']: 
            return {"Failue, language not recognized": 404}
        else:
            file_suffix = args.language
        
        with open(f'words/words_{file_suffix}.json','r') as f:
            words = json.load(f)

        word = words[random.randint(0,len(words))]
      
        app.logger.info(f"Returning word: {word}")
        return {'Word': word}

class Hello(Resource):
    def get(self):
        app.logger.info("Recieved Hello Health Check")
        return {"Hello": 200}

api.add_resource(PostSubmit,'/submit')
api.add_resource(GetWord,'/word')
api.add_resource(Hello,'/hello')

if __name__ == '__main__':
    app.run(debug=True) 
