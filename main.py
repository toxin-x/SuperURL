import urls
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

import httpx
from fastapi.templating import Jinja2Templates
import re
from typing import Optional
from mangum import Mangum
app = FastAPI()


shortcuts = {"ios-version":1, "ios-link": "https://icloud.com/shortcuts/a73f1afef8cb4479b3d361199ebeabae"}



templates = Jinja2Templates(directory="templates")

class Resp(BaseModel):
    url: str
    clean: Optional[int] = 0
    fix: Optional[int] = 0
    archive: Optional[int] = 0
    
    # twitter specific settings 
    # twitter_fixer: Optional[int] = 0 #which service to use 
    
    twitter_format: Optional[int] = 0
    # insta specific settings https://github.com/Wikidepia/InstaFix
    instagram_format: Optional[int] = 0
    
    #pixiv specific settings
    pixiv_index: Optional[int] = 1
    

async def refresh_rules():
    # urls.download_rules_data("rules.json")
    global rules 
    rules = urls.load_cleaning_rules("rules.json")
# download rules on startup


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse(
        request=request, name="superurl.html", context={"iosLink": shortcuts["ios-link"]}
    )


# url = input("url to clean: ")
# print(urls.clean_url(rules= rules, url=url))

@app.get("/api/shortcut")
async def shortcut():
    return shortcuts

@app.post("/api/clean")
async def clean(resp: Resp):
    print(resp)
    await refresh_rules()
    if resp.url:
        output = resp.url
    else: 
        return "Error: URL empty"
    if not re.match("http", output, re.I):
        output = "https://" + output
    if resp.clean:
        output = urls.clean_url(rules, output)
        #https://www.reddit.com/comments/28gpzg/-/iwtv0g9/
        if re.search(r"^(https?:\/\/)?(www\.)?reddit\.com", output):
            output = re.sub(r"com\/[^>]+\/comments", "com/comments", output, 1)
            output = re.sub("comment/", "-", output, 1)
            

    if  resp.archive:
        try:
            httpx.get("http://web.archive.org/save/" + output, timeout=0.1)
            archived = "Sent link to archive.org*"
        except:
            archived = "status unknown"
    else:
        archived = "N/A"
    if resp.fix:
        output = re.sub(r"www\.", "", output, 1)
    #twitter

        # twitter_link = ["fxtwitter.com", "stupidpenisx.com"]
        
        twitter_format = ["", "t.", "g.", "d."]
        # g = media and @ only, t = text only, d = media only 

        #add translation later
        if re.search(r"^(https?:\/\/)?(www\.)?x\.com", output):    
            output = re.sub(r"x\.com", f"{ twitter_format[resp.twitter_format]}fxtwitter.com", output, 1)
        
        elif re.search(r"^(https?:\/\/)?(www\.)?twitter\.com", output):
            output = re.sub(r"twitter\.com", f"{twitter_format[resp.twitter_format]}fxtwitter.com", output, 1)

    #instagram
        
        #d = media only, g = media and @only, 
        elif re.search(r"^(https?:\/\/)?(www\.)?instagram\.com", output):
            instagram_format = ["", "g.", "d."]
            output = re.sub(r"instagram\.com", f"{instagram_format[resp.instagram_format]}ddinstagram.com", output, 1)
    #reddit
        elif re.search(r"^(https?:\/\/)?(www\.)?reddit\.com", output):
            output = re.sub(r"reddit\.com", "rxddit.com", output, 1)
    #tiktok
        #need to fix subdomain search
        elif re.search(r"^(https?:\/\/)?(www\.)?tiktok\.com", output):
            output = re.sub(r"tiktok\.com", "vxtiktok.com", output, 1)
    #pixiv
        elif re.search(r"^(https?:\/\/)?(www\.)?pixiv\.com", output):
            output = re.sub(r"pixiv\.com", "phixiv.net", output, 1)
            output += f"/{resp.pixiv_index}"
    #bsky 
        elif re.search(r"^(https?:\/\/)?(www\.)?bsky\.app", output):
            output = re.sub(r"bsky\.app", "bskyx.app", output, 1)
    
    
    jsonout= '{output:"' + output + '", archived: "' + archived + '"}'
    return jsonout

app.mount("/", StaticFiles(directory="static"), name="static")
handler = Mangum(app)

