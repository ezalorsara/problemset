'use strict';
//------------------------ START #1 Asynchronous Operations ------------------------------//

    const lib = require('./lib/lib');


    function doAsync(input)
    {
    
        if(input.length > 0){
            //check if current element is an array, if it is, do parallel execution
            if(Array.isArray(input[0]))
            {
                let resolve_count = 0
                for(let i in input[0])
                {
                    
                    lib.asyncOp(input[0][i]).then(()=>{
                        resolve_count++;

                        if(resolve_count == input[0].length)
                        {
                            input.shift();
                            doAsync(input);  
                        }
                    });
                    
                }
            }
            // Series Execution
            else
            {
                lib.asyncOp(input[0]).then(()=>{
                    input.shift();
                    doAsync(input);  
                });  
            }
        }
    } 

    let input = [
        'A',
        [ 'B', 'C' ],
        'D'
    ]

    // doAsync(input);    // <--- [UNCOMMENT TO TEST]

//------------------------ END #1 Asynchronous Operations ------------------------------//


//------------------------ START #2 Streams ------------------------------//

    const EventEmitter = require('events');

    class RandStringSource extends EventEmitter
    {


        constructor (randStream) {
            super();
            

            randStream.on('data', data=>{

                let ndot = 0;
                let char = '';
                for(let i=0; i<data.length;i++) {

                    /* 
                    Check if ndot or the current number of dot found is even or odd. 
                    If even start concatenating characters if odd try to ouput cocatenated char if has.  
                    */
                    if(ndot%2 === 0)
                    {
                        char = char.replace('.', '');
                        if(char != "")
                        {
                            console.log(char);
                            char = "";
                            ndot = 0;
                        }
                    }else{
                        if(ndot > 0)
                        {
                            if(data[i] != '.')
                            {
                                char += data[i];
                            }
                            
                        }
                    }



                    if (ndot == 0 && data[i] === ".")
                    {
                        ndot++;
                    }
                    else if(ndot>0 && data[i+1] != undefined && data[i+1] === ".")
                    {
                        ndot++;
                    }
                }


            });

            
        }

        
    }

    // let source = new RandStringSource(new lib.RandStream());     // <--- [UNCOMMENT TO TEST]  

//------------------------ END #2 Streams ------------------------------//




//------------------------ START #3 Resource Pooling ------------------------------//


    class ResourceManager 
    {

        constructor(count)
        {
            this.my_pool = []; // pool of resource
            this.count = count;
            
            // create a resource object
            this.resource = function()
            {
                this.in_use = false;
                this.release = ()=>{
                    this.in_use = false;  
                }
            }

            // inserts resource
            for(let i = 0; i<this.count; i++)
            {
                this.my_pool.push(new this.resource());
            }
            
        }

        borrow(cb)
        {
        
            let found_resource = false;
            for(let i = 0; i<this.count; i++)
            {
                if(this.my_pool[i].in_use == false){
                    found_resource = true;
                    

                    this.my_pool[i].in_use = true;
                    
                    cb(this.my_pool[i]);
                    break;
                }
            }

            // if all resources are in use, try to check available resource again after 100 ms
            if(found_resource == false)
            {
                setTimeout(()=>{
                    this.borrow(cb);
                }, 100);
                
            }
        }

    }

    // [UNCOMMENT THIS BLOCK TO TEST] 
    /*
        
        let pool = new ResourceManager(2);

        console.log('START');

        let timestamp = Date.now();

        pool.borrow((res) => {
            console.log('RES: 1');

            setTimeout(() => {
                res.release();
            }, 500);
        });
        
        pool.borrow((res) => {
            console.log('RES: 2');
        });
        
        pool.borrow((res) => {
            console.log('RES: 3');
            console.log('DURATION: ' + (Date.now() - timestamp));
        });

    */



//------------------------ END #3 Resource Pooling ------------------------------//



