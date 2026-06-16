# dealSources.list

> Source: https://developer.focus.teamleader.eu/docs/api/deal-sources-list

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Sources](/docs/api/deal-sources)
  * dealSources.list



# dealSources.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealSources.list

Get a list of all deal sources, sorted alphabetically (on name).

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Default value:**`name`

**order** Order (string)

**Possible values:** [`asc`]

**Default value:**`asc`

  * ]




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



    
    
    {  
      "data": [  
        {  
          "id": "b18c298b-0e6f-495d-8fcd-31dfecaea741",  
          "name": "Referral"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "b18c298b-0e6f-495d-8fcd-31dfecaea741",  
          "name": "Referral"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealSources.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"string\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"name\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "name",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
