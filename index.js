const redis = require('redis');


exports.handler = async (event, context) => {
    console.log('event:', event);
    console.log('context:', context);

    const httpMethod = event.httpMethod || event.requestContext.http.method;

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    const redis_client = redis.createClient({
        host: 'ffi-redis-standalone-2.1n7lgo.ng.0001.use2.cache.amazonaws.com',
        port: 6379
    });

    try {
        switch (httpMethod) {
            /*case 'DELETE':
                body = await dynamo.delete(JSON.parse(event.body)).promise();
                break;*/
            case 'GET':
                let getFromRedis = new Promise(function(resolve, reject){
                    redis_client.get(event.queryStringParameters.key, function(err, reply) {
                        console.log('!!err: ', err);
                        console.log('!!reply: ', reply);
                        if(!err){
                            console.log('before unref');
                            redis_client.unref();
                            console.log('after unref');
                            resolve(reply);
                        } else {
                            reject(reply);
                        }
                    });
                });


                body = await getFromRedis;
                break;
            case 'POST':
                redis_client.set(event.queryStringParameters.key, event.body);
                body = 'key value pair saved successfully';
                break;
            /*case 'PUT':
                body = await dynamo.update(JSON.parse(event.body)).promise();
                break;*/
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
