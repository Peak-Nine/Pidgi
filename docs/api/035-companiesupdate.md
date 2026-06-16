# companies.update

> Source: https://developer.focus.teamleader.eu/docs/api/companies-update

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Companies](/docs/api/companies)
  * companies.update



# companies.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/companies.update

Update a company.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`4784189d-610b-4488-b3a5-5f324f752417`

**name** string

**Example:**`Pied Piper`

**business_type_id** stringnullable

**Example:**`fd48d4a3-b9dc-4eac-8071-5889c9f21e5d`

**vat_number** stringnullable

**Example:**`BE0899623035`

**national_identification_number** stringnullable

**Example:**`63326426`

**emails** object[]

  * Array [

**type** stringrequired

**Possible values:** [`primary`, `invoicing`]

**Example:**`primary`

**email** stringrequired

**Example:**`info@piedpiper.eu`

  * ]

**telephones** object[]

  * Array [

**type** stringrequired

**Possible values:** [`phone`, `fax`]

**Example:**`phone`

**number** stringrequired

**Example:**`092980615`

  * ]

**website** string

**Example:**`http://example.com`

**addresses** object[]

  * Array [

**type** stringrequired

**Possible values:** [`primary`, `invoicing`, `delivery`, `visiting`]

**Example:**`invoicing`

**address** objectrequired

**line_1** stringnullablerequired

**Example:**`Dok Noord 3A 101`

**postal_code** stringnullablerequired

**Example:**`9000`

**city** stringnullablerequired

**Example:**`Ghent`

**country** stringrequired

**Example:**`BE`

**area_level_two_id** string

**Example:**`db232cf8-ad4a-024b-941f-15a7a74f0fd2`

**addressee** string

**Example:**`Teamleader HQ`

  * ]

**iban** stringnullable

**Example:**`BE12123412341234`

**bic** stringnullable

**Example:**`BICBANK`

**language** stringnullable

**Example:**`en`

**responsible_user_id** stringnullable

**Example:**`0ea94804-401d-4dbd-a577-c2d60998f798`

**remarks** stringnullable

Uses Markdown formatting

**Example:**`Met at expo`

**tags** string[]

This will overwrite existing tags

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**marketing_mails_consent** boolean

**Example:**`false`

**preferred_currency** CurrencyCode (string)nullable

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`EUR`




## Responses​

  * 204



**Response Headers**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/companies.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"4784189d-610b-4488-b3a5-5f324f752417\",\n  \"name\": \"Pied Piper\",\n  \"business_type_id\": \"fd48d4a3-b9dc-4eac-8071-5889c9f21e5d\",\n  \"vat_number\": \"BE0899623035\",\n  \"national_identification_number\": \"63326426\",\n  \"emails\": [\n    {\n      \"type\": \"primary\",\n      \"email\": \"info@piedpiper.eu\"\n    }\n  ],\n  \"telephones\": [\n    {\n      \"type\": \"phone\",\n      \"number\": \"092980615\"\n    }\n  ],\n  \"website\": \"http://example.com\",\n  \"addresses\": [\n    {\n      \"type\": \"invoicing\",\n      \"address\": {\n        \"addressee\": \"Teamleader HQ\",\n        \"line_1\": \"Dok Noord 3A 101\",\n        \"postal_code\": \"9000\",\n        \"city\": \"Ghent\",\n        \"country\": \"BE\",\n        \"area_level_two_id\": \"db232cf8-ad4a-024b-941f-15a7a74f0fd2\"\n      }\n    }\n  ],\n  \"iban\": \"BE12123412341234\",\n  \"bic\": \"BICBANK\",\n  \"language\": \"en\",\n  \"responsible_user_id\": \"0ea94804-401d-4dbd-a577-c2d60998f798\",\n  \"remarks\": \"Met at expo\",\n  \"tags\": [\n    \"prospect\",\n    \"expo\"\n  ],\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ],\n  \"marketing_mails_consent\": false,\n  \"preferred_currency\": \"EUR\"\n}", null, "application/json");  
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
      "id": "4784189d-610b-4488-b3a5-5f324f752417",
      "name": "Pied Piper",
      "business_type_id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d",
      "vat_number": "BE0899623035",
      "national_identification_number": "63326426",
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
      "website": "http://example.com",
      "addresses": [
        {
          "type": "invoicing",
          "address": {
            "addressee": "Teamleader HQ",
            "line_1": "Dok Noord 3A 101",
            "postal_code": "9000",
            "city": "Ghent",
            "country": "BE",
            "area_level_two_id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"
          }
        }
      ],
      "iban": "BE12123412341234",
      "bic": "BICBANK",
      "language": "en",
      "responsible_user_id": "0ea94804-401d-4dbd-a577-c2d60998f798",
      "remarks": "Met at expo",
      "tags": [
        "prospect",
        "expo"
      ],
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ],
      "marketing_mails_consent": false,
      "preferred_currency": "EUR"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
