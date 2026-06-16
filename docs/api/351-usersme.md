# users.me

> Source: https://developer.focus.teamleader.eu/docs/api/users-me

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Users](/docs/api/users)
  * users.me



# users.me
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/users.me

Get the current authenticated user.

## Request​

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

**email_verification_status** string

**Possible values:** [`pending`, `confirmed`]

**Example:**`confirmed`

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

**preferences** object

**invoiceable** boolean

**Example:**`true`

**historic_time_tracking_limit** objectnullable

**unit** string

**Possible values:** [`hour`]

**Example:**`hour`

**value** number

**Example:**`24`

**whitelabeling** boolean

**Example:**`true`



    
    
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
        "email_verification_status": "confirmed",  
        "telephones": [  
          {  
            "type": "phone",  
            "number": "092980615"  
          }  
        ],  
        "language": "nl-BE",  
        "function": "Sales",  
        "time_zone": "Europe/Brussels",  
        "preferences": {  
          "invoiceable": true,  
          "historic_time_tracking_limit": {  
            "unit": "hour",  
            "value": 24  
          },  
          "whitelabeling": true  
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
        "email_verification_status": "confirmed",  
        "telephones": [  
          {  
            "type": "phone",  
            "number": "092980615"  
          }  
        ],  
        "language": "nl-BE",  
        "function": "Sales",  
        "time_zone": "Europe/Brussels",  
        "preferences": {  
          "invoiceable": true,  
          "historic_time_tracking_limit": {  
            "unit": "hour",  
            "value": 24  
          },  
          "whitelabeling": true  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/users.me");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
