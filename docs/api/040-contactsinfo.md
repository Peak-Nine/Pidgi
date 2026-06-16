# contacts.info

> Source: https://developer.focus.teamleader.eu/docs/api/contacts-info

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Contacts](/docs/api/contacts)
  * contacts.info



# contacts.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/contacts.info

Get details for a single contact.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`cde0bc5f-8602-4e12-b5d3-f03436b54c0d`




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

**Example:**`cde0bc5f-8602-4e12-b5d3-f03436b54c0d`

**first_name** string

**Example:**`Erlich`

**last_name** string

**Example:**`Bachman`

**status** string
    * Members 
      * `active`
      * `deactivated`

**Possible values:** [`active`]

**Example:**`active`

**salutation** string

**Example:**`Mr`

**vat_number** stringnullable

**Example:**`BE0899623034`

**emails** object[]

  * Array [

**type** string

**Possible values:** [`primary`]

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

**gender** Gender (string)nullable

**Possible values:** [`female`, `male`, `non_binary`, `prefers_not_to_say`, `unknown`]

**Example:**`unknown`

**birthdate** string

**Example:**`1987-04-25`

**iban** string

**Example:**`BE12123412341234`

**bic** string

**Example:**`BICBANK`

**national_identification_number** string

**Example:**`00051730-A`

**companies** object[]

  * Array [

**position** string

**Example:**`Developer`

**secondary_position** string

**Example:**`Technical lead`

**division** string

**Example:**`'Engineering'`

**decision_maker** boolean

**Example:**`true`

**company** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**language** string

**Example:**`en`

**payment_term** objectnullable

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**invoicing_preferences** object

**electronic_invoicing_address** stringnullable

**remarks** string

Uses Markdown formatting

**Example:**`First contact at expo`

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

**added_at** string

**Example:**`2016-02-04T16:44:33+00:00`

**updated_at** string

**Example:**`2016-02-05T16:44:33+00:00`

**web_url** string

**Example:**`https://focus.teamleader.eu/contact_detail.php?id=cde0bc5f-8602-4e12-b5d3-f03436b54c0d`



    
    
    {  
      "data": {  
        "id": "cde0bc5f-8602-4e12-b5d3-f03436b54c0d",  
        "first_name": "Erlich",  
        "last_name": "Bachman",  
        "status": "active",  
        "salutation": "Mr",  
        "vat_number": "BE0899623034",  
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
        "gender": "unknown",  
        "birthdate": "1987-04-25",  
        "iban": "BE12123412341234",  
        "bic": "BICBANK",  
        "national_identification_number": "00051730-A",  
        "companies": [  
          {  
            "position": "Developer",  
            "secondary_position": "Technical lead",  
            "division": "'Engineering'",  
            "decision_maker": true,  
            "company": {  
              "type": "company",  
              "id": "40157f9d-1322-4f2e-b245-188efdc52cc2"  
            }  
          }  
        ],  
        "language": "en",  
        "payment_term": {  
          "type": "cash"  
        },  
        "invoicing_preferences": {  
          "electronic_invoicing_address": null  
        },  
        "remarks": "First contact at expo",  
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
        "added_at": "2016-02-04T16:44:33+00:00",  
        "updated_at": "2016-02-05T16:44:33+00:00",  
        "web_url": "https://focus.teamleader.eu/contact_detail.php?id=cde0bc5f-8602-4e12-b5d3-f03436b54c0d"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "cde0bc5f-8602-4e12-b5d3-f03436b54c0d",  
        "first_name": "Erlich",  
        "last_name": "Bachman",  
        "status": "active",  
        "salutation": "Mr",  
        "vat_number": "BE0899623034",  
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
        "gender": "unknown",  
        "birthdate": "1987-04-25",  
        "iban": "BE12123412341234",  
        "bic": "BICBANK",  
        "national_identification_number": "00051730-A",  
        "companies": [  
          {  
            "position": "Developer",  
            "secondary_position": "Technical lead",  
            "division": "'Engineering'",  
            "decision_maker": true,  
            "company": {  
              "type": "company",  
              "id": "40157f9d-1322-4f2e-b245-188efdc52cc2"  
            }  
          }  
        ],  
        "language": "en",  
        "payment_term": {  
          "type": "cash"  
        },  
        "invoicing_preferences": {  
          "electronic_invoicing_address": null  
        },  
        "remarks": "First contact at expo",  
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
        "added_at": "2016-02-04T16:44:33+00:00",  
        "updated_at": "2016-02-05T16:44:33+00:00",  
        "web_url": "https://focus.teamleader.eu/contact_detail.php?id=cde0bc5f-8602-4e12-b5d3-f03436b54c0d"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/contacts.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"cde0bc5f-8602-4e12-b5d3-f03436b54c0d\"\n}", null, "application/json");  
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
      "id": "cde0bc5f-8602-4e12-b5d3-f03436b54c0d"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
