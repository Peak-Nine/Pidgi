# products.list

> Source: https://developer.focus.teamleader.eu/docs/api/products-list

  * [](/)
  * [API Reference](/docs/api)
  * Products
  * [Products](/docs/api/products)
  * products.list



# products.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/products.list

Get a list of products.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**term** string

Will filter on the name or the code.

**Example:**`cookies`

**updated_since** string

**Example:**`2019-02-05T16:44:33+00:00`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4`

**name** stringnullable

**Example:**`cookies`

**description** stringnullable

The description of the product in Markdown

**Example:**`dark chocolate`

**code** stringnullable

**Example:**`COOK-DARKCHOC-42`

**unit** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**added_at** string

**Example:**`2016-02-01T11:25:41+00:00`

**updated_at** string

**Example:**`2016-02-01T11:25:41+00:00`

**stock** object

Only available when stock management feature is enabled

**amount** numbernullable

**Example:**`123`

**configuration** objectnullable

**stock_threshold** objectnullable

Only available when stock management feature is enabled

**minimum** number

**Example:**`4`

**action** string

**Possible values:** [`notify`]

**Example:**`notify`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "name": "cookies",  
          "description": "dark chocolate",  
          "code": "COOK-DARKCHOC-42",  
          "unit": {  
            "type": "unitOfMeasure",  
            "id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71"  
          },  
          "added_at": "2016-02-01T11:25:41+00:00",  
          "updated_at": "2016-02-01T11:25:41+00:00",  
          "stock": {  
            "amount": 123  
          },  
          "configuration": {  
            "stock_threshold": {  
              "minimum": 4,  
              "action": "notify"  
            }  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "name": "cookies",  
          "description": "dark chocolate",  
          "code": "COOK-DARKCHOC-42",  
          "unit": {  
            "type": "unitOfMeasure",  
            "id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71"  
          },  
          "added_at": "2016-02-01T11:25:41+00:00",  
          "updated_at": "2016-02-01T11:25:41+00:00",  
          "stock": {  
            "amount": 123  
          },  
          "configuration": {  
            "stock_threshold": {  
              "minimum": 4,  
              "action": "notify"  
            }  
          }  
        }  
      ]  
    }  
    

#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/products.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"bbbfe0da-e692-4ee3-9d3d-0716808d6523\",\n      \"722e1eb9-53d5-4b8c-9d17-154dcc65c610\"\n    ],\n    \"term\": \"cookies\",\n    \"updated_since\": \"2019-02-05T16:44:33+00:00\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "ids": [
          "bbbfe0da-e692-4ee3-9d3d-0716808d6523",
          "722e1eb9-53d5-4b8c-9d17-154dcc65c610"
        ],
        "term": "cookies",
        "updated_since": "2019-02-05T16:44:33+00:00"
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
