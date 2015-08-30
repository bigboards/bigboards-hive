module.exports =  {
    "auth": {
        "_id" : { "path": "token" },
        "_source": { "enabled": true },
        "_ttl": { "enabled": true, "default" : "1h" },
        "dynamic": "strict",
        "properties": {
            "profile_id": { "type": "string", "index": "not_analyzed" },
            "token": { "type": "string", "index": "not_analyzed" },
            "exchanged": { "type": "date", "index": "not_analyzed" },
            "expires": { "type": "date", "index": "not_analyzed" }
        }
    },
    "profile": {
        "_id" : { "path": "username" },
        "_source": { "enabled": true },
        "_timestamp" : {"enabled": true, "store": "yes"},
        "dynamic": false,
        "properties": {
            "username": { "type": "string", "index": "not_analyzed"},
            "firstname": { "type": "string" },
            "surname": { "type": "string" },
            "email": { "type": "string", "index": "not_analyzed"},
            "avatar_url": { "type": "string", "index": "not_analyzed"},
            "gravatar_id": { "type": "string", "index": "not_analyzed"},
            "origin": { "type": "string", "index": "not_analyzed"},
            "bio": { "type": "string" },
            "accounts": {
                "type" : "nested",
                "dynamic" : false,
                "properties" : {
                    "origin": { "type": "string", "index": "not_analyzed" },
                    "username": { "type": "string", "index": "not_analyzed" }
                }
            }
        }
    },
    "item": {
        "_id" : { "path": "id" },
        "_source": { "enabled": true },
        "_timestamp" : {"enabled": true, "store": "yes"},
        "dynamic": false,
        "properties": {
            "id": { "type": "string", "index": "not_analyzed"},
            "title": { "type": "string"},
            "filename": { "type": "string" },
            "basename": { "type": "string", "index": "not_analyzed" },
            "owner": { "type": "string", "index": "not_analyzed" },
            "type": { "type": "string", "index": "not_analyzed" },
            "contents": {
                "type": "nested",
                "dynamic": false,
                "properties": {
                    "rendition": {"type": "string", "index": "not_analyzed"},
                    "mimetype": {"type": "string", "index": "not_analyzed"},
                    "size": {"type": "integer", "index": "analyzed"}
                }
            }
        }
    }
};