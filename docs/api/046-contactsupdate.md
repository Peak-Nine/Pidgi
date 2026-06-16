# contacts.update

> Source: https://developer.focus.teamleader.eu/docs/api/contacts-update

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Contacts](/docs/api/contacts)
  * contacts.update



# contacts.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/contacts.update

Update a contact.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`76c9d03c-ec5c-4b21-9fc6-7ffee488b12d`

**first_name** stringnullable

**Example:**`John`

**last_name** string

**Example:**`Smith`

**salutation** stringnullable

**Example:**`Mr`

**emails** object[]

  * Array [

**type** stringrequired

**Possible values:** [`primary`]

**Example:**`primary`

**email** stringnullablerequired

**Example:**`info@piedpiper.eu`

  * ]

**telephones** object[]nullable

  * Array [

**type** stringrequired

**Possible values:** [`phone`, `mobile`, `fax`]

**Example:**`phone`

**number** stringrequired

**Example:**`092980615`

  * ]

**website** stringnullable

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

**language** string

**Example:**`en`

**gender** Gender (string)nullable

**Possible values:** [`female`, `male`, `non_binary`, `prefers_not_to_say`, `unknown`]

**Example:**`unknown`

**birthdate** stringnullable

**Example:**`1989-08-19`

**iban** stringnullable

**Example:**`BE12123412341234`

**bic** stringnullable

**Example:**`BICBANK`

**national_identification_number** string

**Example:**`19346758-T`

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/contacts.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"76c9d03c-ec5c-4b21-9fc6-7ffee488b12d\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Smith\",\n  \"salutation\": \"Mr\",\n  \"emails\": [\n    {\n      \"type\": \"primary\",\n      \"email\": \"info@piedpiper.eu\"\n    }\n  ],\n  \"telephones\": [\n    {\n      \"type\": \"phone\",\n      \"number\": \"092980615\"\n    }\n  ],\n  \"website\": \"http://example.com\",\n  \"addresses\": [\n    {\n      \"type\": \"invoicing\",\n      \"address\": {\n        \"addressee\": \"Teamleader HQ\",\n        \"line_1\": \"Dok Noord 3A 101\",\n        \"postal_code\": \"9000\",\n        \"city\": \"Ghent\",\n        \"country\": \"BE\",\n        \"area_level_two_id\": \"db232cf8-ad4a-024b-941f-15a7a74f0fd2\"\n      }\n    }\n  ],\n  \"language\": \"en\",\n  \"gender\": \"unknown\",\n  \"birthdate\": \"1989-08-19\",\n  \"iban\": \"BE12123412341234\",\n  \"bic\": \"BICBANK\",\n  \"national_identification_number\": \"19346758-T\",\n  \"remarks\": \"Met at expo\",\n  \"tags\": [\n    \"prospect\",\n    \"expo\"\n  ],\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ],\n  \"marketing_mails_consent\": false\n}", null, "application/json");  
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
      "id": "76c9d03c-ec5c-4b21-9fc6-7ffee488b12d",
      "first_name": "John",
      "last_name": "Smith",
      "salutation": "Mr",
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
      "language": "en",
      "gender": "unknown",
      "birthdate": "1989-08-19",
      "iban": "BE12123412341234",
      "bic": "BICBANK",
      "national_identification_number": "19346758-T",
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
      "marketing_mails_consent": false
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
