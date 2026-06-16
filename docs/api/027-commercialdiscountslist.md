# commercialDiscounts.list

> Source: https://developer.focus.teamleader.eu/docs/api/commercial-discounts-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Commercial Discounts](/docs/api/commercial-discounts)
  * commercialDiscounts.list



# commercialDiscounts.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/commercialDiscounts.list

Get a list of commercial discounts.

## Request​

  * application/json



### Body

**filter** object

**department_id** string

**Example:**`6a6343fc-fdd8-4bc0-aa69-3a004c710e87`




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

**name** string

**Example:**`My holiday discount`

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]



    
    
    {  
      "data": [  
        {  
          "name": "My holiday discount",  
          "department": {  
            "type": "department",  
            "id": "6a6343fc-fdd8-4bc0-aa69-3a004c710e87"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "name": "My holiday discount",  
          "department": {  
            "type": "department",  
            "id": "6a6343fc-fdd8-4bc0-aa69-3a004c710e87"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/commercialDiscounts.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"department_id\": \"6a6343fc-fdd8-4bc0-aa69-3a004c710e87\"\n  }\n}", null, "application/json");  
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
        "department_id": "6a6343fc-fdd8-4bc0-aa69-3a004c710e87"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
