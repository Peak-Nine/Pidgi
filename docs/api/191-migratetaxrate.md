# migrate.taxRate

> Source: https://developer.focus.teamleader.eu/docs/api/migrate-tax-rate

  * [](/)
  * [API Reference](/docs/api)
  * Other
  * [Migrating](/docs/api/migrating)
  * migrate.taxRate



# migrate.taxRate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/migrate.taxRate

Translates tax rates from the deprecated API into a new UUID tax rate.

## Request​

  * application/json



### Body**required**

**department_id** string

**Example:**`6ad54ec6-ee2d-4500-afe6-0917c1aa7a38`

**tax_rate** string

**Example:**`21`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "taxRate",  
        "id": "6ad54ec6-ee2d-4500-afe6-0917c1aa7a38"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "taxRate",  
        "id": "6ad54ec6-ee2d-4500-afe6-0917c1aa7a38"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/migrate.taxRate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"department_id\": \"6ad54ec6-ee2d-4500-afe6-0917c1aa7a38\",\n  \"tax_rate\": \"21\"\n}", null, "application/json");  
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

Body required

  * Example (from schema)
  * Example


    
    
    {
      "department_id": "6ad54ec6-ee2d-4500-afe6-0917c1aa7a38",
      "tax_rate": "21"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
