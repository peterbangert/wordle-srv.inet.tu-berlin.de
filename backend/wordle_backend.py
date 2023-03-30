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
# submit_json_data['add_argument('name',type=str)
# submit_json_data['add_argument('id',type=int)
# submit_json_data['add_argument('guess',type=str)
# submit_json_data['add_argument('condition',type=str)
# submit_json_data['add_argument('guesses_remaining',type=int)
# submit_json_data['add_argument('hard_mode',type=bool)
# submit_json_data['add_argument('word',type=str)
# submit_json_data['add_argument('confidence_level',type=int)
results_header = "name,id,condition,word,guess,guesses_remaining,confidence_level,hard_mode,match_time,game_number,game_time"


# Arguments for Get Words API
# getwords_args = reqparse.RequestParser()
# getwords_json_data['add_argument('language')



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
        # args = submit_json_data['parse_args()
        # app.logger.info(args)
        # args = ''
        json_data = request.get_json(force=True)
        app.logger.info(json_data)
        
        results_csv = f"{results_dir}/{json_data['name']}_{json_data['id']}.csv"

        if not os.path.isfile(results_csv): 
            with open(results_csv, 'a') as f:    
                f.write(f"{results_header}\n")

        result_str = ''
        for x in ["name","id","condition","word","guess","guesses_remaining","confidence_level","hard_mode","match_time","game_number","game_time"]:
            if x == 'name':
                result_str += f"{json_data[x]}"
                continue
            if x == 'guess':
                result_str += f",{''.join(json_data[x])}"
                continue
            result_str += f",{json_data[x]}"

        with open(results_csv, 'a') as f:
            f.write(f"{result_str}\n")
      
        app.logger.info(f"Submission from {json_data['name']},{json_data['id']}: successful")
        # return {f"Submission from {json_data['name']},{json_data['id']}: successful"}
        return jsonify(success=200)


class GetWord(Resource):
    def post(self):
        app.logger.info("Getting Word")
        # args = getwords_json_data['parse_args()
        # app.logger.info(args)
        # args = ''
        json_data = request.get_json(force=True)
        app.logger.info(json_data)

        if json_data['language'] not in ['de','en']: 
            return {"Failue, language not recognized": 404}
        else:
            file_suffix = json_data['language']
        
        with open(f'words/words_{file_suffix}.json','r') as f:
            words = json.load(f)

        rtn_word = words[random.randint(0,len(words))]
      
        app.logger.info(f"Returning word: {rtn_word}")
        # return {'Word': word}
        return jsonify(word=rtn_word)

class Hello(Resource):
    def get(self):
        app.logger.info("Recieved Hello Health Check")
        return {"Hello": 200}

api.add_resource(PostSubmit,'/submit')
api.add_resource(GetWord,'/word')
api.add_resource(Hello,'/hello')

if __name__ == '__main__':
    app.run(debug=True) 
