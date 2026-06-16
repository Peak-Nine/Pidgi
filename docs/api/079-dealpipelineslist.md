# dealPipelines.list

> Source: https://developer.focus.teamleader.eu/docs/api/deal-pipelines-list

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Pipelines](/docs/api/deal-pipelines)
  * dealPipelines.list



# dealPipelines.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPipelines.list

Get a list of all deal pipelines.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**status** string[]

**Possible values:** [`open`, `pending_deletion`]

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

**Example:**`811a5825-96f4-4318-83c3-2840935c6003`

**name** string

  * ]

**meta** object

Only included with request parameter `includes=pagination`

**page** object

**size** number

**Example:**`10`

**number** number

**Example:**`2`

**matches** number

Only included with request parameter `includes=pagination`

**Example:**`12`

**default** string

**Example:**`f350e48a-fbc3-0a79-e62a-53aa1ae86d44`



    
    
    {  
      "data": [  
        {  
          "id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44",  
          "name": "Main Pipeline"  
        }  
      ],  
      "meta": {  
        "default": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44",  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 12  
      }  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44",  
          "name": "Main Pipeline"  
        }  
      ],  
      "meta": {  
        "default": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44",  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 12  
      }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPipelines.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"string\"\n    ],\n    \"status\": [\n      \"open\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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
    
    
    {
      "filter": {
        "ids": [
          "string"
        ],
        "status": [
          "open"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
