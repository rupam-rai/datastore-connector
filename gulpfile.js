/*
 Copyright 2017 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

var gulp = require('gulp');
var prompt_lib      = require('prompt');
var gulpSequence = require('gulp-sequence')
var mustache        = require('mustache');
var path            = require('path');
var fs              = require('fs-extra');


gulp.task('keyreplacement', function( cb) {




    var required_values = [];
    
    required_values.push({name: 'datastoreProject', description: 'Enter the google cloud project Id', type: 'string', required: true});
    required_values.push({name: 'serviceaccount_Private_Key', description: 'Enter the private key associated with your service account', type: 'string', required: true});
    required_values.push({name: 'token_uri', description: 'Enter the token uri of service account', type: 'string', required: true});
    required_values.push({name: 'client_email', description: 'Enter the client email of the service account', type: 'string', required: true});

    prompt_lib.start();

    prompt_lib.get(required_values, function(err, results) {

                    post_prompt(err, results, function( callback)
                    {
                        require('edge-launchpad')(gulp);
                        cb();
                    });

                

                
            });
    
});



gulp.task('dsconnectordeploy', function (cb) {
  gulpSequence('keyreplacement','deploy', cb);
})

function post_prompt(err, results, cb) {
    var inject_object = {};
    var files_list = ['config.yml.template'];
    var paths = [];

    for (var j=0; j<files_list.length; j++) {
        paths.push(path.join(__dirname, files_list[j]))
    }
    var keys = Object.keys(results)

    for(var i=0; i<keys.length; i++){
        inject_object[keys[i]] = results[keys[i]]
    }
    replace_variables(paths, inject_object, function(callback)
        {
            cb(err,results);
        });
            
       
}



function replace_variables(paths, inject_object, cb) {
    mustache.escape = function (value) {
        return value;
    };

    for(var i=0; i<paths.length; i++){
        var path_to_template = paths[i]

        var data

        try {
            data = fs.readFileSync(path_to_template, 'utf8')
        } catch(e){
            console.log(e);
            cb();
        }

        var mu_template = String(data)

        try {
            var output = mustache.render(mu_template, inject_object)
        } catch(e) {
            console.log(e)
            cb();
        }

        try {
            fs.outputFileSync(path_to_template.split('.').slice(0,2).join('.'), output)
        } catch (e){
            console.log(e)
            cb();
        }

        output = '< yet to copy from original template >'
    }
    cb();
}

