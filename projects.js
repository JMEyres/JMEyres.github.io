const projects = {
  "project-alpha": {
    "dirTitle": "Undergraduate Dissertation",
    "title": "Undergraduate Dissertation - AI Prototyping",
    "description": `
    The Goal: Exploring the use of AI for rapid 3D asset generation for game prototyping.

    The Tech: Unity, C#, Point-E (OpenAI), Python.

    The Takeaway: AI is a powerful "force multiplier" for prototyping but requires manual cleanup and careful ethical consideration regarding asset ownership.

    This project i am aware is a relatively controversial topic, however the idea was to explore the capabilites of generative AI and potential use cases for developers that may not have access to 3d modellers or have the money to purchase assets for purely prototyping a project to get a better idea of what it could look like with proper assets.
    
    Many different AI models were considered for this project, however the one that i eventually landed on was Open AI's Point-E Model due to it offering the fastest generation times at the time of creating this project. This was a choice made for two reasons, the first being limited time frame due to it being a university project, and the second, more important reason is that it is being modified to be used within a prototyping timeline so having a faster maybe slightly lower quality model is better than taking much longer to generate a better quality one.
    
    The main findings from this project are that Generative AI can absolutely be used to supplement lack of modelling ability and allow a solo developer or small team to create a functional prototype much more quickly. However at the time of creation AI wasn't as advanced and created many sub par models that went to waste, that being said if the developer has some basic modelling ability they would be able to tidy up those sub par models easily making them usable instead of just generating a new one.
    
    There are also the moral and ethical implications to take note of using AI in this manner, the main one being using an AI model to take that job from a skilled worker essentially making them redundant, certainly as of this projects creation there was no threat of jobs being taken as the output simply wasn't high enough quality. Also the question of who owns the IP of the generated assets which is very unclear and a highly debated topic recently.
    
    Overall this is something that could be used in house for prototype but could definitely NOT be released due to quality, ethical and ip issues it's also my personal belief that if a company or developer has the modellers/modelling ability or the option to pay for assets created by skilled designers they absolutely should over using generative AI in this manner.`,
    "imgPath": "Images/LNDScreenshot.png", // Match your CSS variable format
    "gallery": ["Images/LNDScreenshot.png", "Images/WhatGoesAroundComesAround.png", "Images/LNDScreenshot.png","Images/LNDScreenshot.png","Images/LNDScreenshot.png","Images/LNDScreenshot.png","Images/LNDScreenshot.png",],
    "icon": "Images/alpha-icon.png",
    "tags": ["Unity", "C#", "AI"]
  },
  "project-beta": {
    "dirTitle": "Emmissive Raytracer",
    "title": "Emmisive Raytracer Project",
    "description": `
    The Goal: To create a parallelised ray tracer with emissive functionality.

    The Tech: C++, Glew, OpenGL

    The Takeaway: 

    This project makes use of multiple key concepts, multi threading, accumulation and emmission.
    
    The main thing multi threading was used for is to draw the pixels themselves it's a relatively basic implementation simply using a determined amount of cores with each core being responsible for its own chunk which allows for more efficient rendering to the screen. STATIC THREAD PARTITIONING
    
    Accumulation is where i can set an amount of passes for the program to do and it will generate a buffer to theoretically add together and improve the overall quality of the output. However, in my implemention this only resulted in the final image being made brighter the more passes that were executed.
    
    Finally, I implemented an emissive mode for this project that allowed objects to emit their own light and this to be reflected by the ray tracer instead of a determined light source. This allows for expansion into rendering much more complex scenes in the future.`,
    "imgPath": "Images/Raytracer/Normal 1 Pass.png",
    "gallery": ["Images/Raytracer/Basic Raytracer.jpg", "Images/Raytracer/Normal 1 Pass.png", "Images/Raytracer/Normal 10 Passes.png", "Images/Raytracer/Emissive 1 Pass.png", "Images/Raytracer/Emissive 5 Passes.png", "Images/Raytracer/Emissive 10 Passes.png", "Images/Raytracer/Accumulation.png", "Images/Raytracer/Passes vs time.png", "Images/Raytracer/Threads vs time.png"],
    "icon": "Images/beta-icon.png",
    "tags": ["C++", "CSS", "OpenGL"]
  },
  "project-charlie": {
    "dirTitle": "Custom Game Engine",
    "title": "NSEngine",
    "description": `A custom game engine built using c++, cmake, `,
    "bg": "url('Images/beta-bg.jpg')",
    "icon": "Images/beta-icon.png",
    "tags": ["HTML", "CSS", "JS"]
  },
    "project-delta": {
    "dirTitle": "Project Delta",
    "title": "Project Delta",
    "description": `A retro-style OS interface.`,
    "bg": "url('Images/beta-bg.jpg')",
    "icon": "Images/beta-icon.png",
    "tags": ["HTML", "CSS", "JS"]
  },
    "project-echo": {
    "dirTitle": "Project Echo",
    "title": "Project Echo",
    "description": `A retro-style OS interface.`,
    "bg": "url('Images/beta-bg.jpg')",
    "icon": "Images/beta-icon.png",
    "tags": ["HTML", "CSS", "JS"]
  }
};