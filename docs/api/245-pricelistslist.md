# priceLists.list

> Source: https://developer.focus.teamleader.eu/docs/api/price-lists-list

  * [](/)
  * [API Reference](/docs/api)
  * Products
  * [Price Lists](/docs/api/price-lists)
  * priceLists.list



# priceLists.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/priceLists.list

Get a list of priceLists.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]




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

**name** string

**Example:**`price`

**calculation_method** string

**Possible values:** [`manual`, `based_on_price_list`, `based_on_purchase_price`]

**Example:**`manual`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "name": "price",  
          "calculation_method": "manual"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "2aa4a6a9-9ce8-4851-a9b3-26aea2ea14c4",  
          "name": "price",  
          "calculation_method": "manual"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/priceLists.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"5a37d173-78d3-05f3-b018-d51fadc1c5d2\",\n      \"97233974-7c29-05f5-a51d-fbe3238e6157\"\n    ]\n  }\n}", null, "application/json");  
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
          "5a37d173-78d3-05f3-b018-d51fadc1c5d2",
          "97233974-7c29-05f5-a51d-fbe3238e6157"
        ]
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
