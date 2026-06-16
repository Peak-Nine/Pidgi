# taxRates.list

> Source: https://developer.focus.teamleader.eu/docs/api/tax-rates-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Tax Rates](/docs/api/tax-rates)
  * taxRates.list



# taxRates.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/taxRates.list

Get a list of available tax rates.

## Request​

  * application/json



### Body

**filter** object

**department_id** string

The ID of the department you wish to filter on.

**Example:**`080aac72-ff1a-4627-bfe3-146b6eee979c`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`department_id`, `rate`, `description`]

**order** Order (string)

**Possible values:** [`asc`, `desc`]

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

**Example:**`c93ddb52-0af8-47d9-8551-441435be66a7`

**description** string

**Example:**`21%`

**rate** number

**Example:**`0.21`

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "c93ddb52-0af8-47d9-8551-441435be66a7",  
          "description": "21%",  
          "rate": 0.21,  
          "department": {  
            "type": "department",  
            "id": "182af0a8-3f68-409b-8941-cf8caf8f28a0"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "c93ddb52-0af8-47d9-8551-441435be66a7",  
          "description": "21%",  
          "rate": 0.21,  
          "department": {  
            "type": "department",  
            "id": "182af0a8-3f68-409b-8941-cf8caf8f28a0"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/taxRates.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"department_id\": \"080aac72-ff1a-4627-bfe3-146b6eee979c\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"department_id\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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
        "department_id": "080aac72-ff1a-4627-bfe3-146b6eee979c"
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "department_id",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
