# companies.info

> Source: https://developer.focus.teamleader.eu/docs/api/companies-info

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Companies](/docs/api/companies)
  * companies.info



# companies.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/companies.info

Get details for a single company.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5`

**includes** string

when used, the response will include `related_companies` and/or `related_contacts`

**Example:**`related_companies,related_contacts`




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

**Example:**`e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5`

**name** string

**Example:**`Pied Piper`

**status** string
    * Members 
      * `active`
      * `deactivated`

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**business_type** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`businessType`

**vat_number** string

**Example:**`BE0899623035`

**national_identification_number** string

**Example:**`63326426`

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

**type** stringrequired

**Possible values:** [`phone`, `fax`]

**Example:**`phone`

**number** stringrequired

**Example:**`092980615`

  * ]

**website** string

**Example:**`https://piedpiper.com`

**addresses** object[]

  * Array [

**type** string

**Possible values:** [`primary`, `invoicing`, `delivery`, `visiting`]

**Example:**`invoicing`

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

**addressee** string

**Example:**`Teamleader HQ`

  * ]

**iban** string

**Example:**`BE12123412341234`

**bic** string

**Example:**`BICBANK`

**language** string

**Example:**`nl`

**preferred_currency** stringnullable

**Example:**`EUR`

**payment_term** objectnullable

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**invoicing_preferences** object

**electronic_invoicing_address** stringnullable

**responsible_user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**remarks** string

Uses Markdown formatting

**Example:**`First contact at expo`

**added_at** string

**Example:**`2016-02-04T16:44:33+00:00`

**updated_at** string

**Example:**`2016-02-05T16:44:33+00:00`

**web_url** string

**Example:**`https://focus.teamleader.eu/company_detail.php?id=e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5`

**tags** string[]

**custom_fields** object[]

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
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

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**marketing_mails_consent** boolean

**Example:**`false`

**related_companies** object[]

Only included with request parameter `includes=related_companies`

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**related_contacts** object[]

Only included with request parameter `includes=related_contacts`

  * Array [

**type** string

**Example:**`contact`

**id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**position** stringnullable

**Example:**`Developer`

**secondary_position** stringnullable

**Example:**`Technical lead`

**division** stringnullable

**Example:**`Engineering`

**is_decision_maker** boolean

**Example:**`false`

  * ]



    
    
    {  
      "data": {  
        "id": "e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5",  
        "name": "Pied Piper",  
        "status": "active",  
        "business_type": {  
          "type": "businessType",  
          "id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d"  
        },  
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
        "website": "https://piedpiper.com",  
        "addresses": [  
          {  
            "type": "invoicing",  
            "address": {  
              "addressee": "Teamleader HQ",  
              "line_1": "Dok Noord 3A 101",  
              "postal_code": "9000",  
              "city": "Ghent",  
              "country": "BE",  
              "area_level_two": {  
                "type": "area_level_two",  
                "id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"  
              }  
            }  
          }  
        ],  
        "iban": "BE12123412341234",  
        "bic": "BICBANK",  
        "language": "nl",  
        "preferred_currency": "EUR",  
        "payment_term": {  
          "type": "cash"  
        },  
        "invoicing_preferences": {  
          "electronic_invoicing_address": null  
        },  
        "responsible_user": {  
          "type": "user",  
          "id": "7ba98a20-5e2b-4b46-81b9-a3364432d4f0"  
        },  
        "remarks": "First contact at expo",  
        "added_at": "2016-02-04T16:44:33+00:00",  
        "updated_at": "2016-02-05T16:44:33+00:00",  
        "web_url": "https://focus.teamleader.eu/company_detail.php?id=e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5",  
        "tags": [  
          "prospect",  
          "expo"  
        ],  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "marketing_mails_consent": false,  
        "related_companies": [  
          {  
            "type": "company",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          }  
        ],  
        "related_contacts": [  
          {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
            "position": "Developer",  
            "secondary_position": "Technical lead",  
            "division": "Engineering",  
            "is_decision_maker": false  
          }  
        ]  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5",  
        "name": "Pied Piper",  
        "status": "active",  
        "business_type": {  
          "type": "businessType",  
          "id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d"  
        },  
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
        "website": "https://piedpiper.com",  
        "addresses": [  
          {  
            "type": "invoicing",  
            "address": {  
              "addressee": "Teamleader HQ",  
              "line_1": "Dok Noord 3A 101",  
              "postal_code": "9000",  
              "city": "Ghent",  
              "country": "BE",  
              "area_level_two": {  
                "type": "area_level_two",  
                "id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"  
              }  
            }  
          }  
        ],  
        "iban": "BE12123412341234",  
        "bic": "BICBANK",  
        "language": "nl",  
        "preferred_currency": "EUR",  
        "payment_term": {  
          "type": "cash"  
        },  
        "invoicing_preferences": {  
          "electronic_invoicing_address": null  
        },  
        "responsible_user": {  
          "type": "user",  
          "id": "7ba98a20-5e2b-4b46-81b9-a3364432d4f0"  
        },  
        "remarks": "First contact at expo",  
        "added_at": "2016-02-04T16:44:33+00:00",  
        "updated_at": "2016-02-05T16:44:33+00:00",  
        "web_url": "https://focus.teamleader.eu/company_detail.php?id=e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5",  
        "tags": [  
          "prospect",  
          "expo"  
        ],  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "marketing_mails_consent": false,  
        "related_companies": [  
          {  
            "type": "company",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456"  
          }  
        ],  
        "related_contacts": [  
          {  
            "type": "contact",  
            "id": "f29abf48-337d-44b4-aad4-585f5277a456",  
            "position": "Developer",  
            "secondary_position": "Technical lead",  
            "division": "Engineering",  
            "is_decision_maker": false  
          }  
        ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/companies.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5\",\n  \"includes\": \"related_companies,related_contacts\"\n}", null, "application/json");  
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
      "id": "e8d31ae7-8258-4fcd-9b2d-78f41b0aa5d5",
      "includes": "related_companies,related_contacts"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
