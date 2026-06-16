# users.info

> Source: https://developer.focus.teamleader.eu/docs/api/users-info

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Users](/docs/api/users)
  * users.info



# users.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/users.info

Get details for a single user.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5`

**includes** string

when used, the response will include `external_rate`

**Example:**`external_rate`




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

**Example:**`cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5`

**account** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`account`

**first_name** string

**Example:**`John`

**last_name** string

**Example:**`Smith`

**email** string

**Example:**`john@teamleader.eu`

**telephones** object[]

  * Array [

**type** string

**Possible values:** [`phone`, `mobile`, `fax`]

**Example:**`phone`

**number** string

**Example:**`092980615`

  * ]

**language** UserLanguage (string)

**Possible values:** [`nl-BE`, `da`, `de`, `en`, `es`, `fi`, `fr`, `it`, `nb`, `nl`, `pl`, `pt`, `sv`, `tr`]

**Example:**`nl-BE`

**function** string

**Example:**`Sales`

**time_zone** string

**Example:**`Europe/Brussels`

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**teams** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`team`

  * ]

**external_rate** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]



    
    
    {  
      "data": {  
        "id": "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",  
        "account": {  
          "type": "account",  
          "id": "0fc55513-7f68-4865-aba0-de5da9e4e43d"  
        },  
        "first_name": "John",  
        "last_name": "Smith",  
        "email": "john@teamleader.eu",  
        "telephones": [  
          {  
            "type": "phone",  
            "number": "092980615"  
          }  
        ],  
        "language": "nl-BE",  
        "function": "Sales",  
        "time_zone": "Europe/Brussels",  
        "status": "active",  
        "teams": [  
          {  
            "type": "team",  
            "id": "6dd0069e-45da-0ec4-911a-afb351d968cd"  
          }  
        ],  
        "external_rate": {  
          "amount": 123.3,  
          "currency": "EUR"  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",  
        "account": {  
          "type": "account",  
          "id": "0fc55513-7f68-4865-aba0-de5da9e4e43d"  
        },  
        "first_name": "John",  
        "last_name": "Smith",  
        "email": "john@teamleader.eu",  
        "telephones": [  
          {  
            "type": "phone",  
            "number": "092980615"  
          }  
        ],  
        "language": "nl-BE",  
        "function": "Sales",  
        "time_zone": "Europe/Brussels",  
        "status": "active",  
        "teams": [  
          {  
            "type": "team",  
            "id": "6dd0069e-45da-0ec4-911a-afb351d968cd"  
          }  
        ],  
        "external_rate": {  
          "amount": 123.3,  
          "currency": "EUR"  
        }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/users.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5\",\n  \"includes\": \"external_rate\"\n}", null, "application/json");  
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
      "id": "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",
      "includes": "external_rate"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
