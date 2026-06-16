# dealPhases.list

> Source: https://developer.focus.teamleader.eu/docs/api/deal-phases-list

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Phases](/docs/api/deal-phases)
  * dealPhases.list



# dealPhases.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPhases.list

Get a list of all phases a deal can go through, sorted by their order in the flow.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**deal_pipeline_id** string

**Example:**`53a7e592-a136-4bae-ae15-517befd3d75d`

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

**Example:**`21efc56e-1ba8-469d-926a-e89502591b47`

**name** string

**Example:**`New`

**actions** string[]

Only returned when user has access to planning and deal automation

**Possible values:** [`create_event`, `create_call`, `create_task`]

**requires_attention_after** object

Time period in this phase after which a deal requires attention

**amount** number

**Example:**`7`

**unit** string

**Possible values:** [`days`, `weeks`]

**Example:**`days`

**probability** number

**Example:**`0.75`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "21efc56e-1ba8-469d-926a-e89502591b47",  
          "name": "New",  
          "actions": [  
            "create_event"  
          ],  
          "requires_attention_after": {  
            "amount": 7,  
            "unit": "days"  
          },  
          "probability": 0.75  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "21efc56e-1ba8-469d-926a-e89502591b47",  
          "name": "New",  
          "actions": [  
            "create_event"  
          ],  
          "requires_attention_after": {  
            "amount": 7,  
            "unit": "days"  
          },  
          "probability": 0.75  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPhases.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"53a7e592-a136-4bae-ae15-517befd3d75d\",\n      \"bb50af79-55cd-4be0-8306-e9626c70a90f\"\n    ],\n    \"deal_pipeline_id\": \"53a7e592-a136-4bae-ae15-517befd3d75d\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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
          "53a7e592-a136-4bae-ae15-517befd3d75d",
          "bb50af79-55cd-4be0-8306-e9626c70a90f"
        ],
        "deal_pipeline_id": "53a7e592-a136-4bae-ae15-517befd3d75d"
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
