# departments.info

> Source: https://developer.focus.teamleader.eu/docs/api/departments-info

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Departments](/docs/api/departments)
  * departments.info



# departments.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/departments.info

Get details for a single department.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`92296ad0-2d61-4179-b174-9f354ca2157f`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)



**Schema**

**data** object

**id** string

**Example:**`67c576e7-7e6f-465d-b6ab-a864f6e5e95b`

**name** string

**Example:**`Human Resources`

**vat_number** string

**Example:**`BE0899623035`

**address** object

**line_1** stringnullable

**Example:**`Dok Noord 3A 101`

**postal_code** stringnullable

**Example:**`9000`

**city** stringnullable

**Example:**`Ghent`

**country** string

**Example:**`BE`

**area_level_two** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`area_level_two`

**emails** object[]

  * Array [

**type** string

**Possible values:** [`primary`, `invoicing`]

**Example:**`primary`

**email** string

**Example:**`info@piedpiper.eu`

  * ]

**telephones** object[]

  * Array [

**type** string

**Possible values:** [`phone`, `mobile`, `fax`]

**Example:**`phone`

**number** string

**Example:**`092980615`

  * ]

**website** string

**Example:**`https://piedpiper.com`

**currency** string

**Example:**`EUR`

**iban** string

**Example:**`BE12123412341234`

**bic** string

**Example:**`BICBANK`

**fiscal_regime** stringnullable

**Example:**`RF01`

**status** string

**Possible values:** [`active`, `archived`]

**Example:**`active`



    
    
    {  
      "data": {  
        "id": "67c576e7-7e6f-465d-b6ab-a864f6e5e95b",  
        "name": "Human Resources",  
        "vat_number": "BE0899623035",  
        "address": {  
          "line_1": "Dok Noord 3A 101",  
          "postal_code": "9000",  
          "city": "Ghent",  
          "country": "BE",  
          "area_level_two": {  
            "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
            "type": "area_level_two"  
          }  
        },  
        "emails": [  
          {  
            "type": "primary",  
            "email": "info@piedpiper.eu"  
          }  
        ],  
        "telephones": [  
          {  
            "type": "phone",  
            "number": "092980615"  
          }  
        ],  
        "website": "https://piedpiper.com",  
        "currency": "EUR",  
        "iban": "BE12123412341234",  
        "bic": "BICBANK",  
        "fiscal_regime": "RF01",  
        "status": "active"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/departments.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"92296ad0-2d61-4179-b174-9f354ca2157f\"\n}", null, "application/json");  
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
      "id": "92296ad0-2d61-4179-b174-9f354ca2157f"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
