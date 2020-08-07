getCredentials(hostname){
    if(hostname=== "localhost"){
        const obj = {
            "user":"postgres",
            "host":"localhost",
            "database":"postgres",
            "password":"Nordural050196",
            "port":5432
        };
        return obj;
    }else{
        const obj = {
            "user":"drejoxqksziety",
            "host":"ec2-54-195-247-108.eu-west-1.compute.amazonaws.com",
            "database":"d711qi31b5sskh",
            "password":"c1d0a5ba1ad75f9e465c78ea4222e2f5c83fda8184415a77e38100ce5feac47c",
            "port":5432
        };
        return obj;
    }
}
