# Everything I wanted to know about gfx-hal/Vulkan/graphics programming but had to spend a month Googling to figure out and I've still only learned like 5% of it and I probably learned some of that wrong anyway

## for me, an attempt at catharsis; for you, a possibly helpful guide to graphics programming with Rust and also `gfx_hal` and sort of Vulkan

### a dissertation by Ryan McGowan — ryan@internally-combusted.net

#### version -0.0.01101010cleverasciibinarythingy

## Okay but what is all this even

The length of the title and subtitle should give you an idea as to what this is and the type of writing I do. Or at least the type I do in this document.

This whole thing's in an extremely long and rambling sort-of-question-and-answer format. I had a lot of questions while I was figuring this all out and I still have a lot of questions, and often a pile of commented code isn't going to answer a lot of those questions. So I'm offering this to the internet in the hope that at least one poor soul will suffer through it long enough to find something useful.

## Should there be a disclaimer? Or seventeen disclaimers?

Probably yes. 

The main thing is that I've scattered a bunch of code throughout this document, but if you copy and paste it all together it's not going to give you a functioning renderer. It'll be a Frankensteinian amalgamation of renderer parts at best. 

The code is mostly there to give you an idea of what things might look like. Some of my actual renderer code lives on [my github portfolio thingy](https://github.com/internally-combusted/portfolio/tree/master/renderer).

## I have a few specific practical questions and please answer them at the top so I don't have to read this entire thing.

Okay.

### How do I handle extremely simple things like have a number of models/textures/things that is more than 1 and also maybe the number changes over time because my program is not completely boring? Like, what if I sometimes need two textures in a scene and sometimes three? 

Vulkan apparently demands to know exactly how many things exist and really hates it if you change the number of things that exist. The dumb but obvious solution is to make space for way more things than you will ever probably need. There are probably better solutions but I haven't figured them out yet.

### That was my only question.

Oh. 

# Okay then. What's gfx_hal? 

## oops I mean `gfx_hal`
### actually maybe [gfx_hal](https://github.com/gfx-rs/gfx)

`gfx_hal` is a crate (library) for the [Rust](https://www.rust-lang.org) programming language that lets you do magical 2D or 3D graphics programming type things. I guess you could do 1D graphics programming also if you really wanted to for some reason.

## Is it simple and easy?

I don't think I've seen a simple "draw triangle at screen" program for Vulkan shorter than 500 lines of code. It's just a massive piece of machinery that takes quite a bit of setting up.

So...I don't think it's simple, but maybe you will.

## Is that why this FAQ-like thing is so long? 

Yes. Also I'm long-winded and I think I'm clever.

But not clever enough to make auto-didacting my way through modern graphics programming super easy. 

## Ugghhh I just have one question and I don't want to read this whole dissertation

If you are not yet acquainted with your browser's "find" function, now is an excellent time to do that. 

If your browser does not have a "find" function, you are probably an accidental time traveler from the 1990's, in which case I feel like graphics programming should not be very high on your list of priorities.

## Who are you anyway? Do you even know what you're talking about?

I'm a random internet person who decided to try learning graphics programming one day. I probably don't know what I'm talking about and everything here might be wrong, but I'm slowly succeeding in making `gfx_hal` do things I want it to do, so I'm just tossing out whatever I can to make it happen less slowly for other people and make myself feel like I learned a little bit maybe.

## What do I need to already know for this file to possibly be useful? 

A general understanding of Rust is probably helpful. You don't need to have achieved complete mastery over the borrow checker or anything. I certainly haven't.

Knowledge of some very basic graphics programming theory will probably be the most important thing you need. If you don't know what a vertex is, or don't understand what transformation matrices do, or haven't heard of UV-mapping, you should probably read something else like [Learn OpenGL](https://learnopengl.com). Maybe you should read that instead of this even if you do know all those things. 

Basically, I know *slightly* more than is necessary to make a very, very simple program with Vulkan/Rust, so you probably don't need a huge background in graphics differential calculus physics computers or whatever.

## What's the general idea of `gfx_hal`?

`gfx_hal` is based on the [Vulkan](https://www.khronos.org/vulkan) specification, a super-hip new way of doing low level graphics programming. `gfx_hal`'s API seems to follow that of Vulkan pretty closely, but the really nifty part is that it has multiple backend crates so that your `gfx_hal` code will work on lots of different graphics type things like Metal, DirectX, and OpenGL. At least, that's what it's supposed to do. I haven't tried that part out yet.

Anyway, one of the nice things about this setup is that resources, tutorials, etc. for Vulkan will usually apply to `gfx_hal` as well. This makes it much easier to find answers and learn the ropes. Unfortunately, when something is really really really confusing, making it "much easier" might only bring it up to the level of "really confusing".

Also, the internet appears to be quite stingy with information beyond how to make a basic "Hello World"/triangle program. I'm not much past that point myself, but I'll do what I can.

## How does it work?

Here is a vague outline of a program:

* Find the limits and capabilities of the hardware we're working with.
* Specify what kind of information we want to send to the GPU and how that information is structured.
* Specify some options regarding what we want the GPU to do with information we send it.
* Load all of our drawing data into CPU memory.
* Copy data from CPU memory to GPU memory.
* Make some virtual screens to draw on.
* Make sure things are synchronized so we aren't drawing over stuff that hasn't been displayed yet or anything like that.
* Build a list of instructions for the GPU to perform each frame.
* Execute the list of instructions each frame.

Some of the ordering here is pretty variable, but some isn't. 

# Pipelines

## that's a word I've heard in connection with graphics things

Most of the stuff in the outline above is part of a graphics pipeline. A pipeline is basically a conveyor belt in a factory. You put your raw materials (models, textures, etc.) on one end and press the button. As things roll down the line, various robots and machines work on them, and at the end is a nice shiny screenful of things you wanted to draw on the screen.

Of course, it's *your* job to build all the machines and put them at the right places along the conveyor belt. `gfx_hal` just gives you the parts to build the machines from.

Have you played Factorio? It's like that, except there are no aliens waiting to attack you. Probably.

## What's a pipeline look like? 

There are a bunch of parts that I haven't fiddled with yet, but the major parts seem to be:

* Attributes
* Descriptors
* Buffers
* Shaders
* four hundred tiny other things

# Attributes

## what are those

Taken together, a set of attributes describes the basic structure of your program's vertex data. Depending on how you set things up, your vertex data may just be the three-dimensional coordinates for each vertex. Here's what that might look like in your Rust code: 

```rust
// renderer.rs

let mut pipeline_desc = GraphicsPipelineDesc::new( /* other stuff */ )
pipeline_desc.attributes.push(AttributeDesc {
                location: 0,
                binding: 0,
                element: Element {
                    format: Format::Rgb32Float,
                    offset: 0,
                },
            });
```

## What's this location and binding stuff? 

A major part of the pipeline is specifying how data is transferred from the CPU to the GPU. You can sort of think of bindings as roads between the two, and locations are lanes inside the roads. We'll get to that in more detail later.

## Okay but why is the format RGBsomething? That's colors and we're supposed to be sending coordinates. 

That is an excellent question, and one I'm asking as well. Attribute formats are all described using color formats for some reason, but the basic idea is that the `rgba` part gives the number of values in the attribute, the number gives the size, and the last bit is the data type. Here, `Rgb32Float` means that this attribute contains three 32-bit float values. If your (x, y, z) coordinates are in a Rust `Vec<f32>` or `[f32; 3]` or maybe a `vec3` from the `nalgebra-glm` crate, you've got 3 32-bit floats and `Rgb32Float` is the format you'll use for that. 

## Can I have more than one attribute?

Yep, you'll just call `attributes.push(...)` once for each attribute you want to be part of your vertex data. Note that each of them must have a different `location` value. Usually you can just use locations 0, 1, 2, etc., but there are some datatypes that use more than one "lane", like matrices. I don't know what the rules are exactly on what types take up how many location slots, but if your attributes are all just vectors with 32-bit values, that should be 1 location each. 

## Okay but what would I use more than one attribute for?

A pretty common example would be sending the color data for each vertex along with the position. You might have the position attribute like I posted above, and then you might add a second attribute like:

```rust
// renderer.rs

pipeline_desc.attributes.push(AttributeDesc {
                location: 1,
                binding: 0,
                element: Element {
                    format: Format::Rgba32Float,
                    offset: 0,
                },
            });
```

Now you can put 4 32-bit floats (note that it's `Rgba` here, not `Rgb`) for your (r, g, b, a) values in location 1.

Maybe you could put the (u, v) coordinates for your textures in a third attribute with format `Rg32Float`. Maybe there's something else your program needs, like a `u32` that represents what type of object the vertex is part of. That could be a fourth attribute with type `R32Uint` (1 value, 32 bits, unsigned int).

## How does it know that the first attribute is coordinates and the second is color and so on?

It doesn't! Attributes just specify the amount, type, and structure of data to expect for each vertex. Once the data reaches the graphics card, it'll go through the vertex shader (more on that later) and the shader program you write will tell the GPU what all the different attributes mean.

# Descriptors

### What's a descriptor? 

After attributes, the second major part of a pipeline is its descriptors.

As far as I can tell, a descriptor is any data the graphics card needs that isn't directly attached to the vertices with an attribute. You need descriptors for things like textures and...other things. Maybe meshes or matrices? I don't know, that's all I'm using them for at the moment.

## How are descriptors different from attributes? 

Attributes are *per-vertex*. You have to send new (x, y, z) coordinates for every single vertex you want to draw.

Descriptors are for data that will be used by more than one vertex. 

An example is textures. If you're drawing a teapot, you might have one texture that all the vertices use. You don't want to attach the entire texture to every vertex. Instead, the texture lives in a descriptor. Then each vertex just needs an attribute containing the coordinates for the point on the texture it uses.

## How do I set up descriptors?

There's a few steps involved. Note that all of the steps are probably not going to be all one continuous chunk of code. Other things will have to happen between them that I may or may not get around to specifying exactly. Worst case, check out some example programs.

### Step 1: Create a descriptor pool

This is just telling the GPU the total number of each descriptor type that your program will use. 

You can have more than one set of descriptors; the pool needs to include every descriptor in every set.

```rust
// renderer.rs

let mut pool = unsafe { device.create_descriptor_pool(
        1,  // number of descriptor sets        

        // slice containing RangeDescs 
        &[  // I need one SampledImage (basically, a texture)
            DescriptorRangeDesc {
                ty: DescriptorType::SampledImage,
                count: 1,
            },
            // and one Sampler (thing that reads data from a texture)
            DescriptorRangeDesc {
                ty: DescriptorType::Sampler,
                count: 1,
            },
        ],
    )?
};
```

### Step 2: Create descriptor sets containing descriptor bindings.

If you only have one descriptor set, this is basically repeating step one with a little more information.

To create a set:

```rust
// renderer.rs

let descriptor_set_layout = unsafe {
    device.create_descriptor_set_layout(
        // slice containing the DescriptorSetBindings for the set
        &[
            // here's my SampledImage
            DescriptorSetLayoutBinding {
                binding: 0,
                ty: DescriptorType::SampledImage, 
                count: 1, 
                // which shaders can use this descriptor
                stage_flags: ShaderStageFlags::FRAGMENT,
                // whether this binding uses the immutable samplers below?
                immutable_samplers: false,
            },
            // and my Sampler
            DescriptorSetLayoutBinding {
                binding: 1, // each descriptor uses one binding I think
                ty: DescriptorType::Sampler,
                count: 1,
                stage_flags: ShaderStageFlags::FRAGMENT,
                immutable_samplers: false,
            },
        ],

        // slice containing immutable sampler descriptors
        &[],
    )
}
```

#### Why would I use more than one descriptor set?
You can change which descriptor sets are bound (active) pretty easily, so maybe you'd have one set for things that rarely change and another for things that change all the time. That way you do less binding and can be more flexible with which resources the GPU is using.

An example is that one way to do multiple textures is to have one set for each texture and to swap out the currently bound set each time you want to use a different texture. 

I don't know if that's a good way of doing it, but it's a possibility.

#### What's an immutable sampler? 

I have no idea. 

#### What happens if I set the `count` to more than one?

It creates an array of descriptors. If you had, say, *two* textures instead of one, you could have an array of `SampledImages` by setting `count: 2`. The fragment shader will then look something like this:

```glsl
// shader.frag

layout (set = 1, binding = 1) uniform texture2D texture_data[2];
```

and in your shader code you can use it like any other array. 

I'm not sure if this is better or worse than the descriptor switching thing I said earlier, but it's another possibility.

Also, as far as I know you can't specify something like `texture_data[num_textures]` in GLSL. The number of things in the array has to be a constant. Maybe this is a downside of this method for textures?

### Step 3: Allocate descriptor sets from the pool.

This one's easy, at least.

```rust
// renderer.rs

let descriptor_set = unsafe { 
    pool.allocate_set(&descriptor_set_layout)
}?;
```

This'll "check out" all the `Descriptor`s in the set's layout from the `DescriptorPool`. If you goof up and your pool doesn't have enough `Descriptor`s of the types you ask for, sadness may result. Also, remember that the pool is shared by all your descriptor sets. 

#### What if I don't know how many descriptors I need, or the number might change?

There's a "reset" function for the descriptor pool so maybe you can recreate it with a different number of things? I feel like that's probably not a very good way to do things, but I haven't found any other ways, so...maybe just have 40 million descriptors in the pool and hope you don't need them all?

### Step 4: `DescriptorSetWrite`s

Step 4 is to repeat step 2 but add slightly more information. At this point you're attaching actual textures or whatever to each set.

```rust
// renderer.rs

unsafe {
    device.write_descriptor_sets(
        // The only argument is an iterable container of DescriptorSetWrites
        vec![
            // Here's my SampledImage again...
            DescriptorSetWrite {
                set: &descriptor_set,
                // Make sure the bindings match the ones in the layout above
                binding: 0, 
                array_offset: 0,
                // A container with the actual resource(s) to use (the image_view thing is a texture)
                // We would like our texture to be optimized for being read by the shader
                descriptors: vec![Descriptor::Image(&image_view, Layout::ShaderReadOnlyOptimal)],
            },      
            // And here's the Sampler again...      
            DescriptorSetWrite {
                set: &descriptor_set,
                binding: 1,
                array_offset: 0,
                // If you use different kinds of containers for the descriptors
                // field in different DescriptorSetWrite structs you will get
                // horrible and horribly mystifying error messages
                // 
                // so make them both Vecs or both Options or whatever
                descriptors: vec![Descriptor::Sampler(&sampler)],
            },
    ]);
}
```
#### What are the array offsets? What arrays are those for?

I have no idea.

### Step 5: Bind the descriptor set(s)

Finally, you need to queue up a command to bind the descriptors. This happens toward the end of your renderer code, in the part where you're building a list of instructions for the GPU to execute for the frame.

```rust
// renderer.rs
command_buffer.bind_graphics_descriptor_sets(
        &pipeline_layout, // something I haven't written about yet
        0,  // first set?
        vec![&descriptor_set], // iterable container of your descriptor set(s)
        &[], // offsets?
    );

```

#### Do those question marks mean you have no idea what the `first_set` and `offsets` arguments do?

Yep!

#### So if I decide to change my program's descriptor setup somewhere down the road, I have to change...

A bunch of different parts of your code, yes. You might need to adjust the number/type of descriptors in the pool, you'll have to change your set layouts and `DescriptorSetWrites`, and you might need to make changes in your shaders as well.

## Descriptor Types

Here we'll go over some of the basic descriptors you might use. And by "we" I mean "I".

### `SampledImage`

A `SampledImage` is just an image that will be sampled by a `Sampler`. Basically, a texture.

### `Sampler`

`Image`s just kind of hang around in GPU memory. In order to actually use them, you need some way of pulling data from them into the fragment shader. `Sampler`s appear to be the main way of doing this. 

#### Why can't I just grab whatever pixel data I need directly? 

Maybe you can, but I haven't figured it out yet. 

#### Does the `Sampler` at least do anything other than just grabbing the color at points on the texture I give it? 

Yes. The different options are in the `SamplerInfo` struct. The `new` method seems to only take a filtering mode and a wrapping mode, so I don't know if the other options like anisotropic filtering and level-of-detail/mipmap stuff work at all.

#### What's filtering? 

Quite frequently, your texture doesn't *precisely* match the size of the surface it's being applied to. When this happens, the texture is stretched or shrunk to fit. If a 2x2 texture is stretched over a 3x3 surface, we can put the 4 texels (texture pixels) at the corners, but that leaves 5 empty pixels. Filtering is just the process of figuring out what color to make those empty pixels based on the texels surrounding them.

#### What are the filter options? 

`Filter::Nearest` just copies the color of a nearby texel. `Filter::Linear` does math on the nearby texels to get a color intermediate between them. `Nearest` makes things blockier and `Linear` looks smoother.

#### What's the wrapping mode? 

This just tells the fragment shader what to do if it's asked to grab a texel that's outside of a texture's borders. For example, if you specify that a giant wall should use a tiny 10x10 texture, `WrapMode::Tile` will just repeat the texture's pattern to cover the entire wall. `Mirror` does what you'd expect, and `Clamp` just keeps repeating whatever color was at the edge of the texture. I'm not really sure how that's different from `Border`. 

#### How does it decide whether to stretch the texture or to wrap it? 

I'm not sure. 

#### How many `Sampler`s do I need?

`Sampler`s aren't attached to any specific `Image`. Unless you need different `Sampler` settings, like a filtering mode, you can just have one `Sampler` and use it with any `SampledImage` in the fragment shader. I think. Anyway, here's how that looks in the fragment shader code.

```glsl
// shader.frag

void main() {
    color = texture(sampler2D(texture_data[texture_index], texture_sampler), texture_coordinates);
}
```

### `CombinedImageSampler`

Just a `SampledImage` and a `Sampler` bundled together. This might be faster than having them separate maybe? The internet doesn't really seem to know exactly.

# Buffers

## What are buffers? 

They're chunks of memory that you store stuff in. 

## How many buffers do I need and of what types? 

Generally, every bit of information you want the GPU to have will need to be in some kind of buffer. You can probably have as many buffers as you want, but at some point you have to allocate memory for your buffers and for some reason, Vulkan limits the number of times you can make allocation calls. I don't know what the limit is exactly, but I have gotten `AllocationError::TooManyObjects` before. I was only trying to use a few buffers, so either the limit can be very low or my code was doing something terrible and stupid. Anyway, the point is that you may need to allocate a large chunk of memory and have different buffers use different regions of it.

At minimum you need one vertex buffer, to store all of the attribute data for your vertices. If you're doing indexed drawing, you also need an index buffer to store the indices to be drawn. 

### What's indexed drawing? 

In graphicsland we like for everything to be triangles, so instead of drawing a square directly we draw two triangles and put them together to make the square. Drawing two separate triangles normally takes six vertices:

```
// Triangle #1
Vertex 1: [0, 0]
Vertex 2: [1, 0]
Vertex 3: [1, 1]

// Triangle #2
Vertex 1: [0, 0]
Vertex 2: [1, 1]
Vertex 3: [0, 1]
```

Both triangles use `[0, 0]` and `[1, 1]`, so we can do this instead:

```
Vertex 1: [0, 0]
Vertex 2: [1, 0]
Vertex 3: [1, 1]
Vertex 4: [0, 1]

Triangle 1: Vertices 1, 2, 3
Triangle 2: Vertices 3, 4, 1

```

Now instead of repeating the position of every single index, we list all of the vertex information once. Then to draw triangles, all we have to do is list the *indices* of the triangle's three vertices.

It's not a big deal with a small number of triangles that only have 2D position data, but if your vertex data looks like this:

```
Vertex 1: position [0, 0, 0] color [45, 75, 100, 255] uv [.776, .2392]
Vertex 2: position [1, 0, 0] color [255, 255, 255, 70] uv [0, 0]
// etc.
```

then indexed drawing can save a lot of time and space.

## How do I set up vertex/index buffer(s)?

```rust
// renderer.rs

// If your vertex attributes are Rgb32Float for (x, y, z) and Rgba32Float for (r, g, b, a), that's 7 f32 values.
let vertex_buffer = unsafe {
    device
        .create_buffer(
            // The total size of all your vertex data.
            (number_of_vertices * 7 * std::mem::size_of::<f32>()) as u64,
            Usage::VERTEX,
        )
        .expect("O NOEZ")
};

// This is if you're using u16 for your indices 
// (maybe not enough if you do actual things, that's less than 66k vertices unless I did math wrong)
let index_buffer = unsafe {
    device
        .create_buffer(
            (number_of_indices * std::mem::size_of::<u16>()) as u64,
            Usage::INDEX,
        )
        .expect("ALSO O NOEZ")
};
```
### Won't the number of vertices and indices vary from frame to frame? 

Probably! Even if you can calculate the exact number of vertices and indices you have, I don't think Vulkan will let you resize/reallocate the buffers every frame, and even if it did, it probably wouldn't be a good idea. 

My current solution is to just to make the buffers bigger than I expect I'll need in the worst case. It seems like a bad solution but it's working for me at the moment.

### Are there `Usage` values other than `::VERTEX` and `::INDEX`?

Staging buffers for loading textures use `::TRANSFER_SRC` because they'll be the source you transfer from when you copy the texture to an `Image`.

There are a bunch of other ones, but I don't really understand what they're for yet.

### You said something about allocation earlier.

Yeah, a `Buffer` starts out as a kind of imaginary container. You need to make space for it (allocation) and attach it to that space (binding) before you can put things in it.

This ends up being a two-step process.

#### Buffer allocation, step 1: Finding the correct memory type

There are different kinds of memory. I don't know what they all are, but the two obvious options are your computer's memory and your graphics card's memory. 

Sub-step 1 is to find out what kinds of memory you can use.
```rust
// renderer.rs

// Replace gfx_backend_metal with a different backend if you're a boring non-Mac user.
use gfx_backend_metal as backend; // if you're using Rust 2018 edition
extern crate gfx_backend_metal as backend; // if you're using not Rust 2018 edition

// `Instance::create()` might take different arguments depending on the backend.
let instance = backend::Instance::create(&a_str, a_u32); // I have no idea what these arguments do.

// This is what I saw in a tutorial. I think 'adapter' just means 'graphics card',
// so this just lists all the available cards and chooses the first one.
let adapter = instance.enumerate_adapters().remove(0); 

// No, I'm not sure what an Instance is.

// ANYWAY
// This is how you find out what memory types are available.
let memory_types = adapter.physical_device.memory_properties().memory_types;
```
Sub-step two is to find out what kind of memory your `Buffer` needs.
```rust
//renderer.rs

let requirements = device.get_buffer_requirements(&buffer));
let memory_type =
    // We want the CPU to be able to read/write to this buffer.
    select_memory_type(&requirements, memory_types, Properties::CPU_VISIBLE).unwrap().expect("O NOEZ");
```
Now for step 2!

#### Buffer allocation, step 2: Allocation and binding

This is where you actually attach the buffer to a chunk of memory.

```rust
// renderer.rs

let requirements = device.get_buffer_requirements(&buffer);
let memory = device.allocate_memory(memory_type, buffer.requirements.size)?;
device.bind_buffer_memory(&memory, 0, &mut buffer)?;
```
#### What's the 0 in the `bind_buffer_memory()` call?

That's the memory offset (in bytes). I said earlier that you might need to allocate one chunk of memory and put multiple buffers in it. By setting the offset in the bind call, you can tell your program which parts of the allocated memory belong to which buffer. If you have two buffers, you might do:

```rust
// renderer.rs

let indices_size: u64 = number_of_indices * std::mem::size_of::<u16>();
let vertices_size: u64 = number_of_vertices * 3 * std::mem::size_of::<f32>();

// Create the buffers.
let index_buffer = unsafe {
    device.create_buffer(indices_size, Usage::INDEX).expect("URG1") };
let vertex_buffer = unsafe {
    device.create_buffer(vertices_size, Usage::VERTEX).expect("URG2") };

// Add up the size requirements of all the buffers and allocate the memory.
let total_size = indices_size + vertices_size;
let buffer_memory = device.allocate_memory(memory_type, total_size)?;

device.bind_buffer_memory(&memory, 0, &mut index_buffer);
device.bind_buffer_memory(&memory, indices_size, &mut vertex_buffer);
```

I'm not sure if all that will compile but it should be enough to give you the general idea. The index buffer will take up the range `[..indices_size]` in the allocated memory, and the vertex buffer will take up `[indices_size..]`.

#### I just feel like there hasn't been enough buffer binding so far. 

You're in luck! You have to bind vertex and index buffers *twice*. Just like the last step for descriptors, the last step for vertex and index buffers is a bind command to the GPU. Again, this happens at the end when you're loading up the GPU draw commands (anything that starts with `command_buffer.` is part of that step).

```rust
// renderer.rs 

unsafe {
    command_buffer.bind_index_buffer(IndexBufferView {
        buffer: &index_buffer,
        offset: 0,  // offset in number of indices, not bytes
        index_type: IndexType::U16, // Change this if you're not using u16 for your indices.
    });

    // Note that the second argument is a Vec of tuples, (&buffer, offset)
    // The offset's probably in vertices (not bytes)
    // and the first 0 is supposed to be `first_binding` but I'm not sure what that does exactly.
    command_buffer.bind_vertex_buffers(0, vec![(&vertex_buffer, 0)]);
}
```

Again, this probably only needs to be done once unless you change which buffers you're using. I've tried using multiple vertex and index buffers and couldn't get it to work, so...yeah.

## How do I put data in a buffer?

You need to get a mapping writer, which is basically just a window on the buffer's memory. You can use it just like an array.

Once you've got your data in a slice or a container that you can convert to a slice, you can do something like:

```rust
// renderer.rs

unsafe {
    let mut writer = device
        .acquire_mapping_writer(
            &allocated_memory,
            // This is the section of the allocated memory the writer will cover.
            // The offset is the place in the allocated memory where our buffer begins.
            offset..offset + buffer.requirements.size, 
    )
    .expect("Couldn't acquire writer for buffer!");

    // writer acts like an array where writer[0] is equivalent to allocated_memory[offset]
    writer[..data.len()].copy_from_slice(data);

    device
    .release_mapping_writer(writer)
    .expect("Couldn't release writer for buffer!");
}
```

## What about that staging buffer stuff?

As I mentioned earlier, a buffer with `Usage::TRANSFER_SRC` can be used as a staging buffer for textures. After creating, allocating, and binding the buffer, you can do `copy_from_slice()` just like above to copy your image data to the buffer. Textures use `Image`s instead of buffers, so the process of transferring the data from `Buffer` to `Image` will be covered later.

Note that the staging buffer itself doesn't need to be transferred to the GPU, so we don't need to add a descriptor for it. The `Image` is what the GPU gets, so we use a `SampledImage` descriptor for that, not a buffer descriptor.

## Okay what about buffers that aren't index or vertex or staging buffers?

Data other than your vertex attributes and textures can get transferred to the GPU via a uniform buffer (`Usage::UNIFORM`). For example, if you want to send the current time to the GPU so it can rotate your image over time, you could do something like:

```rust
// renderer.rs

use std::time::Instant;

/* somewhere in your renderer code... */

// Get the fractional part of the current time in milliseconds.
let the_time = Instant::now().subsec_millis(); 

// Create the buffer.
let time_buffer = unsafe {
    device
        .create_buffer(
            std::mem::size_of<u32>(), // subsec_millis() gives a u32
            Usage::UNIFORM,
        )
        .expect("NO TIME LIKE THE PRESENT")
};

// Allocate and bind.
let time_requirements = device.get_buffer_requirements(&time_buffer);
let time_memory = device.allocate_memory(memory_type, time_buffer.requirements.size)?;
device.bind_buffer_memory(&time_memory, 0, &mut time_buffer)?;

// copy data to the buffer
let mut writer = device
        .acquire_mapping_writer(
            &time_memory,
            0..std::mem::size_of<Instant>(), 
    )
    .expect("Couldn't acquire writer for buffer!");

    writer[..].copy_from_slice(&[the_time]);

    device
    .release_mapping_writer(writer)
    .expect("Couldn't release writer for buffer!");

// You need one of these in your descriptor pool creation:
    &[pso::DescriptorRangeDesc {
        ty: DescriptorType::UniformBuffer,
        count: 1, // or if you already had some, increase the count
    }],

// You need one of these in your descriptor set layout:
    DescriptorSetLayoutBinding {
        binding: 4, // or whatever
        ty: DescriptorType::UniformBuffer, 
        count: 1, 
        stage_flags: ShaderStageFlags::VERTEX,
        immutable_samplers: false,
    },

// You need one of these in your descriptor set writes:
    DescriptorSetWrite {
        set: &descriptor_set, // or whatever
        binding: 4,  // or whatever, it needs to match the one in the layout
        array_offset: 0,
        // the second argument is a Range<Option<Offset>>
        // maybe the offset for the buffer in its allocated memory?
        // I'm not using uniform buffers atm so I'm not sure
        // the None..None thing is from the colour-uniform example on gfx_hal's GitHub
        descriptors: vec![Descriptor::Buffer(&time_buffer, None..None)],
    },  
```

After all of that madness, now you need to tell your shader(s) how to use this data. We specified in the binding that it's only linked to the vertex shader, so that's the one we need to change. For the below, we'll assume that you added `time_buffer` to descriptor set 0. 

```glsl
// shader.vert

#version 450
// YES I KNOW I HAVEN'T GOTTEN TO SHADERS YET BUT THIS IS RELEVANT HERE

 // the set and binding need to match the ones in your descriptors
layout (set = 0, binding = 4) uniform time_block {
    // uint is the GLSL equivalent of Rust's u32
    uint chronulon; // you can name the variable whatever you want
} blocko; 

void main() {
    // now you can use blocko.chronulon as a variable in your shader function
    gl_Position = /* bluh bluh bluh ... */;
}
```

Note that `blocko` in the shader code is optional. If you don't put anything there, you'd use `chronulon` in the shader code instead of `blocko.chronulon`.

Also note that in GLSL you can do something like this (I think):

```glsl
layout (set = 0, binding = 4) uniform uint chronulon;
```

But Vulkan/SPIR-V doesn't let you have uniform primitives outside of a block structure.

## Let's pretend that I've heard about push constants.

I'm glad you asked! Push constants are an easier and better version of uniform variables. The catch is that all of your push constants can only take up a very small amount of space. The amount depends on the hardware, but all that you're guaranteed is 128 bytes. A 32-bit float takes 4 bytes, so 128 bytes is only enough space to store 32 32-bit values. 

That said, it's good to use push constants if you can, because modifying them is faster than uniform buffers and it's much easier to set them up. 

Here's the setup:

```rust 
// renderer.rs

// We haven't gotten to this yet, but this is part of creating the actual pipeline
// from all the parts we've covered so far.
let pipeline_layout = unsafe {
            device.create_pipeline_layout(
                vec![
                    // I forgot about this one.
                    // This is place #5 you might have to change your code if you change
                    // your descriptor setup. If you have more than one descriptor set,
                    // you have to list them all here.
                    &descriptor_set_layout, 
                ],
                // And here are the push constants. 
                &[
                    // The fragment shader will have access to 4 32-bit values
                    (ShaderStageFlags::FRAGMENT, 0..4) 
                    ], 
            )
        }
        .unwrap();
```

Then, whenever you want to update the push constants, you submit a call to your command queue:

```rust
// renderer.rs

command_buffer.push_graphics_constants(
    &pipeline_layout,
    ShaderStageFlags::FRAGMENT,
    0, // an offset
    &constant_data, // A &[u32] containing the new push constant data
);
```

Both of these bits happen a little later in the code though.

### What's the offset exactly? 

I'm not sure. I assume that if you'd defined your push constants with something like `(ShaderStageFlags::FRAGMENT, 0..8)`, you could then do

```rust
// renderer.rs

command_buffer.push_graphics_constants(
    &pipeline_layout,
    ShaderStageFlags::FRAGMENT,
    3,
    &new_dataz, // A &[u32; 4]
);
```

to only change the data in slots 3, 4, 5, and 6.

### What if the data I want to use for push constants isn't `u32`?

An example in Lokathor's [lovely gfx how-to guide](https://lokathor.github.io/learn-gfx-hal/05_shaders.html) seems to indicate that you can just do something like `&[my_f32_dataz].to_bits()`. 

### How do I use the constants in a shader?

```glsl
// shader.frag

layout ( push_constant ) uniform SecretData {
    vec4 secrets;
} supersecret ; 
// ^ Again, if you leave this off, you can access the value with `secrets` instead of `supersecret.secrets`

void main() {
    color = supersecret.secrets;
}
```

### Why are they called push constants? 

I think they have to be constant during a draw call; you can only change them between calls. As for the push part, I have no idea.

# Shaders

On to the last major part of the pipeline sort of!

## What's a shader?

It's a program (that you write) that runs on the graphics card.

## How do I write a shader?

A shader program is just another file in your project.

Shaders are written in a C-like language called GLSL. The files conventionally have extensions reflecting what kind of shader they are. For example, vertex shader files usually end in `.vert`, but this isn't mandatory.

## How do I get my program to use a shader program?

It takes a little work, unfortunately.

 Vulkan/`gfx_hal` don't use GLSL directly. The GLSL files need to be compiled into a different language called SPIR-V. I'm using the crate `shaderc` to compile shaders, but there might be other ones out there. 

 ## How do I compile the shaders alongside my regular Rust code? 

There are probably two ways to do it. 

### Version 1: Compile the shaders separately.

 If you put a `build.rs` file in your project folder (the same directory as your `Cargo.toml`), Cargo will automatically run it when you do `cargo build` or `cargo run` or whatever. 

 The `build.rs` is its own program with its own `fn main()` and you write the code to call the SPIR-V compiler on all your shader files there. 

 Because `build.rs` is a separate program, you'll need to tell Cargo about any crates it uses, even if you use the same ones in your regular project. You can do this by putting something like this in your `Cargo.toml`:

 ```toml
 # Cargo.toml

 [build-dependencies.shaderc]
version = "0.3.16"
 ```

 Note that it's `build-dependencies` instead of just `dependencies`.

 #### What do I put in my `build.rs`?

 I found a good example from Mistodon [here](https://falseidolfactory.com/2018/06/23/compiling-glsl-to-spirv-at-build-time.html).

 #### What's the other version?

 ### Version 2: Compile the shaders in your Rust program.

 You load the shader files into your program and call the function(s) from your shader-compiling crate to compile your shaders. I don't do it this way so I don't have code for how to do it right now.

## Okay anyway what are the different types of shaders?

## Vertex shaders

Vertex shaders are the first ones in the pipeline.

### What's a vertex shader?

It's a program on the GPU that takes vertex data (and other data), maybe transforms it, and then sends it on to the next stage of the pipeline.

### How does it get the vertex data? 

Whichever vertex buffer(s) were in your last `bind_vertex_buffers()` call (see above) will automatically be used as the source for vertex data.

When the GPU begins drawing the frame, it calls the vertex shader once for every vertex in the buffer, unless you're doing indexed drawing. Then the shader runs once for every index in the index buffer. It still uses the vertex buffer for the vertex data though.

### What data do I send for each vertex?

When you set up your attributes earlier, you were specifying how to read the data in the vertex buffer. If you did something like:

```rust
// renderer.rs

pipeline_desc.attributes.push(AttributeDesc {
                location: 0,
                binding: 0,
                element: Element {
                    format: Format::Rgb32Float,
                    offset: 0,
                },
            });
pipeline_desc.attributes.push(AttributeDesc {
                location: 1,
                binding: 0,
                element: Element {
                    format: Format::Rgba32Float,
                    offset: 0,
                },
            });
pipeline_desc.attributes.push(AttributeDesc {
                location: 2,
                binding: 0,
                element: Element {
                    format: Format::Rg32Float,
                    offset: 0,
                },
            });                        
```
your program will send 9 `f32` values (a `[f32; 3]`, a `[f32; 4]`, and a `[f32; 2]`) from the vertex buffer to the vertex shader for each vertex.

In your vertex shader, you need to specify a matching set of input values:

```glsl
// shader.vert

#version 450

layout (location = 0) in vec3 coordinates; 
layout (location = 1) in vec4 color; 
layout (location = 2) in vec2 texture_coordinates;
```
It's entirely up to you what to name each input value and how to use it in the shader. All `gfx_hal` cares about is that the attributes in your Rust code match the input variables in your vertex shader.

### What do I do with the data once it's in the vertex shader?

At the very least you need something like:

```glsl
// shader.vert

void main() {
    gl_Position = vec4(coordinates.xyz, 1.0);
}
```

`gl_Position` is some kind of special variable that represents the vertex's 3D coordinates. You don't need to (or maybe can't?) specify it as an output variable like you do with other variables, which we'll see in a bit.

### Why do 3D coordinates need a `vec4`? Isn't time the fourth dimension? Can I make vertices travel through time? 

I'm pretty sure the fourth value is just there for math reasons. If you experience time-traveling vertices, please contact a mental health professional, substance abuse counselor, or theoretical physicist as appropriate. 

### What's the `.xyz` business?

In GLSL, you can access the elements of a `vec` type variable using `.x`, `.y`, and `.z`. (The fourth thing in a `vec4` is `.w`.) In a `vec2` you can only use `.x` and `.y`, obviously.

As a sort of shorthand, instead of writing `coordinates.x, coordinates.y, coordinates.z` you can just write `coordinates.xyz`. There's some other stuff you can do also:

```glsl
// Pseudocode type thing

doink = vec4(1.0, 2.0, 3.0, 4.0);
doink.xyz // = (1.0, 2.0, 3.0)
doink.zyx // = (3.0, 2.0, 1.0)
doink.zx // = (3.0, 1.0)
doink.rgba // = (1.0, 2.0, 3.0, 4.0); you can use rgba instead of xyzw
doink.stpq // = (1.0, 2.0, 3.0, 4.0); xyzw, rgba, and stpq are all equivalent
doink.acde // DOESN'T WORK, the three sets above are the only ones allowed
doink.xgpw // DOESN'T WORK, you can't mix letters from different sets
doink.arrr // DOESN'T WORK, you can only use each element once
```

All this nonsense is called *swizzling*.

#### Swizzling?

Yeah I don't know either, that's just what it's called.

### Okay what else do I do with the vertex shader? 

The point of a shader is to receive data, maybe do something with it, and then send data down the pipeline. Other than `gl_Position`, you can specify what sorts of things the vertex shader should send as output:

```glsl
// shader.vert

layout (location = 0) in vec3 coordinates; 
layout (location = 1) in vec4 color; 
layout (location = 2) in vec2 texture_coordinates;

layout (location = 0) out vec4 color_out;
layout (location = 1) out vec2 texture_coordinates_out;
// gl_Position doesn't have to go here because it's special I guess

void main() {
    gl_Position = vec4(coordinates.xyz, 1.0);
    color_out = color;
    texture_coordinates_out = texture_coordinates;
}
```
This vertex shader program receives coordinate, color, and texturing data, then immediately sends them to the next shader (the fragment shader by default, though we'll get to that eventually). 

The shader's a program, so you can mess with the data if you want. For example, if you wanted to flip the texture coordinates, you could do:

```glsl
    texture_coordinates_out = texture_coordinates.yx;
```
You could even make new variables and go crazy:

```glsl
    laser_colors = vec4(1.0, 0.0, 0.0, 1.0); // pew pew
    color_out = vec4(laser_colors.x, color.y, laser_colors.z, 0.7);
```

#### Why not send the color and texture data directly to the fragment shader?

It's a pipeline. The vertex shader is the pipe's entrance and all data has to go through it. It decides what to do with all the data; maybe it changes some, maybe it leaves some unchanged, maybe it keeps some and doesn't pass it down the pipeline. Whatever the case, the next shader in the pipeline can only receive what the vertex shader outputs.

#### Why not do something like `color = color` instead of `color_out = color`?

It makes the shader sad if you do that. It wants you to keep the names of input and output variables separate.

#### Do the input and output locations all have to match up?

Not in the same shader. You can receive color data at location 0 and output it at location 5 if you want.

However, whatever you send from a location has to be received at the same location in the next shader. If the vertex shader has `layout (location = 1) out vec4 whateva;` whichever shader comes next needs to have `layout (location = 1) in vec4 a_thingy;`. The names don't have to match, just the locations and data types.

### Okay what is this "next shader" you keep talking about? 

There are a bunch of different shader stages and they always go in a certain order, but most of them are optional. The main ones are the vertex shader (the first one) and the fragment shader (the last one). If you only write the vertex and fragment shaders, everything your vertex shader outputs will go directly to the fragment shader. If you have a geometry shader, the vertex shader will send the data there, and the fragment shader will get the output of the geometry shader. All the other optional shader stages work the same way.

## So what's the fragment shader do? 

As far as I can tell, it just decides what color everything should be. I don't know what fragments are. 

### How's it work? 

It takes data from whichever shader came before it and it outputs a color value for each vertex. Just like the vertex shader, the fragment shader's `main()` runs once on each vertex.

### What's a fragment shader look like?

```glsl
// shader.frag

#version 450

// make sure the locations match the out ones in the vertex shader
// the names can be different though
layout (location = 0) in vec2 texture_coordinates;
layout (location = 1) flat in uint texture_index;

// there doesn't seem to be a magical variable like gl_Position but for color
// I think if you only output one thing from the fragment shader it assumes it's the color?
layout (location = 0) out vec4 color;

// if your bind_graphics_descriptor_sets call had more than one thing in it
// the index of each set is the number you use here
// so if you had a descriptor set with a uniform buffer
// and a descriptor set with a sampler and texture
// the the uniform buffer is set 0 and the sampler and texture are set 1
layout (set = 1, binding = 0) uniform sampler texture_sampler;
layout (set = 1, binding = 1) uniform texture2D texture_data[2];

void main() {
    color = texture(sampler2D(texture_data[texture_index], texture_sampler), texture_coordinates);
}
```

### You said it does colors, but that's a texture. 

Yes, the fragment shader can use textures as part of the "figuring out what color things should be" process.

### Can I use rgba color and textures together?

Yes, but I don't know how to do the math to make it look nice. Maybe you just multiply the rgba vector by the texture result?

### What happens after the fragment shader?

Blending or something? I dunno, mostly it just puts colors on the screen, if you did everything correctly.

### What about stencilbuffers and tesselation shaders and  

No idea. I'll read up on those eventually. Probably.

## Building the pipeline

Alright, FINALLY we've got mostly all the pieces together and can start building the pipeline.

The steps:

1. create descriptor set layout(s)
2. create descriptor pool
3. allocate sets
4. `write_descriptor_sets`
5. create pipeline layout

```rust
// renderer.rs

let pipeline_layout =
            device.create_pipeline_layout(
                // v the descriptor set layout(s) you made go here
                vec![&sampler_layout, &texture_layout], 
                &[] // push constants live here
            )?;
```

6. create shader modules

```rust
// renderer.rs

let vertex_shader_module = {
            let spirv = include_bytes!("shaders/gen/shader.vert.spv");
            device.create_shader_module(spirv)?
        };

        let fragment_shader_module = {
            let spirv = include_bytes!("shaders/gen/shader.frag.spv");
            device.create_shader_module(spirv)?
        };
```
7. ugh I forgot you have to do a render pass

## Render pass? 

Yes, the render pass(es) give some general information on what the GPU will do for each frame.

### (es)?

You can do more than one, and there are subpasses, and I don't really know what they're for.

### how do renderpass

Here is part one, the color attachment.

```rust
// renderer.rs 

// You do some setup back near the beginning of the renderer code to pick 
// the color format. I didn't cover that but you can see it in exampples
// and tutorials.
let color_attachment = Attachment {
    format: Some(surface_color_format),
    samples: 1, // maybe for multisampling but I don't know what that is yet
    ops: AttachmentOps::new(AttachmentLoadOp::Clear, AttachmentStoreOp::Store),
    stencil_ops: AttachmentOps::DONT_CARE,
    layouts: Layout::Undefined..Layout::Present,
};
```

#### What's an attachment?

Something that's part of a render pass I guess.

#### Ops?

If you have more than one render pass, they kind of act like a mini-pipeline, sort of like how the shaders work. You can have the first render pass save information for the second render pass to read, and the second can save information for the third pass to read, and so on.

There are load and store ops. The load op is what the render pass does when it starts and the store op is what it does when it finishes. Here, `AttachmentLoadOp::Clear` means that this render pass will erase the data from the previous pass, and `AttachmentStoreOp::Store` means that it will leave its data behind for the next render pass.

#### Why would I have multiple render passes and why would I pass data between them? 

Probably for some cool graphics effects things. 

#### Do the clears and stores work across frames or only for the render passes in a single frame?

Probably option #2, but that's just a guess.

#### And the stencil ops? 

I haven't even read what stencils are yet. 

#### Okay what about the layout range thing? 

There are different layout stages I guess, and the range specifies what stage this render pass starts in and which it ends in. The transitions are done automatically so at least you don't have to worry about that.

#### What are the `Undefined` and `Present` layout stages?

I think the beginning and the end of the frame? I dunno.

#### Are there other attachments? 

Probably.

### Okay whatever what's part two of the render pass? 

Making subpass desc(s)!

```rust
// renderer.rs 

let subpass_desc = SubpassDesc {
    colors: &[(0, Layout::ColorAttachmentOptimal)],
    depth_stencil: None,
    inputs: &[],
    resolves: &[],
    preserves: &[],
};
```

#### Which if any of those things do you know what they are for?

Is that how words work? I'm not sure that's how words work.

Anyway, I think the inputs and preserves are for the actual data that will be read at the start of the pass and sent at the end of the pass, like I was saying earlier. I don't know how they work.

I don't know what resolves are, or the depth stencil, and I'm not sure what the `color` thing's about since we just made a color attachment but it doesn't go there for some reason.

### Okay step 3.

```rust
// renderer.rs

let dependency = SubpassDependency {
    passes: SubpassRef::External..SubpassRef::Pass(0),
    stages: PipelineStage::COLOR_ATTACHMENT_OUTPUT
        ..PipelineStage::COLOR_ATTACHMENT_OUTPUT,
    accesses: Access::empty()
        ..(Access::COLOR_ATTACHMENT_READ | Access::COLOR_ATTACHMENT_WRITE),
};
```

#### ???

Basically I have no idea what all this does. I think it's a synchronization thing so passes/subpasses don't fly around crashing into each other, and instead happen in order.

### Are there any more steps

Just actually creating the render pass. Finally.

```rust
// renderer.rs

let render_pass = unsafe { 
    device.create_render_pass(
        &[color_attachment], // I think you can guess what these arguments are
        &[subpass], 
        &[dependency]
    ).unwrap()};
```

### The render pass is finished, are we done yet?

Very no :(

### ughghgghugghghgughsuafhsalfjsalkf ;a

### you said the shaders were the last step like five hours ago and then you started a list of steps and we're up to like step eight 

I know and I'm sorry, I was wrong D:

### I'll never forgive you.

That's fair. 

# What are steps 8 through 123712893719 of creating the pipeline then?

Mostly some pipeline configuration stuff and also telling the pipeline which shaders to use and so on.

## Are you going to cover all those?

No. We've covered most of the big stuff that goes into the pipeline now, if you want a full code example of everything ever you can maybe find an example or tutorial.

## Is this the end? 

No, sadly.

## Ugghhh what else is there?

We have to create the swapchain, framebuffers, and synchronization primitives. After that, we're done with the setup!

## ...setup?

Yeah all of this is just setting up the pipeline.

## ...

## That is a ridiculous amount of work. 

Yes but fortunately, actually *using* the pipeline once you've made it is pretty short!

## Okay good. What's the framechainprimiwhatever?

The swapchain seems to be a fancy name for what they used to call double or triple buffering. Basically, instead of drawing one frame, then showing it, then showing the next frame, etc., you have multiple "canvases". You have one displayed on the screen while you work on another in the background, then when you're finished you swap them, displaying the second and drawing the third frame on the first frame's canvas, which you hopefully erase first. 

I think that's the general idea, anyway. 

It's a chain because you can have more than two I guess. 

## The frameprimiwhatever?

The framebuffers are the actual "canvases" I think, the swapchain just handles the swapping part.

## Synchronization primitives? 

The main ones here seem to be *semaphores*, which are basically little flags. You can tell one part of your program to stop and wait for another part to finish. When it finishes, it'll raise a little flag, and when the first part sees the little flag go up, it knows it's okay to start running again.

The application here is that since we can be doing multiple things at the same time, we need to make sure that things don't start getting out of order.

The main synchronization in the renderer is making sure that we're ready for a new frame before submitting a command queue to draw a new one, and that we don't swap to a new canvas/framebuffer before it's finished.

## Is the setup done now?

Yes.

# Okay how do we draw a frame?

Once the pipeline's set up, you start the actual "rendering frames" part of things. 

For each frame, you build a command buffer, which is just a list of things for the GPU to do, like "make texture 47 the active texture" and "do the shadow drawing bit" and "here are some triangles to draw" and "divert all power to the warp core". 

Then you submit your command buffer to the GPU and it hopefully does the things on the list.

You can have multiple command buffers at one time but I don't know what that's for.

Anyway, here are the steps.

## 1. Clear your command buffer/queue/pool.

```rust
// renderer.rs 

unsafe {
    // Get rid of all commands from the previous frame.
    command_pool.reset();
}
```

## 2. Get a clean canvas/framebuffer/whatever.

```rust
// renderer.rs

let frame_index: SwapImageIndex = unsafe {
    match swapchain
        // here's the semaphore making sure we wait until a new framebuffer's available
        .acquire_image(!0, FrameSync::Semaphore(&frame_semaphore))
    {
        Ok(index) => index,
        Err(err) => panic!(err), // errbody
    }
};
```

## 3. Maybe copy your vertex/index data to their respective buffers? 

I showed you how to do that a long time ago and talked about maybe you don't need to do this every frame.

## 4. Start recording GPU commands using the command buffer.

```rust
// renderer.rs 

// Multishot means we can use this more than once.
let mut command_buffer = command_pool.acquire_command_buffer::<MultiShot>();

unsafe {
    command_buffer.begin(false); // not really sure what the false does here
}
```

## 5. Bind all of the things. I mentioned this in passing earlier. 

Basically, if you have multiple vertex/index buffers or anything else, binding them makes them "active", and any draw commands that come afterward will only use the stuff you've bound. The bind functions all reset things when you call them, so if you bind vertex buffers 2 and 3, and then call bind again with buffers 1 and 3, only 1 and 3 will be bound.

This is also a thing that maybe you don't need to do every frame.

```rust
// renderer.rs

command_buffer.bind_vertex_buffers(
    0, // an offset
    vec![(vertex_buffer, 0)] // the 0 is another offset
    // there are too many offsets in this API
    // and I am confused
);

command_buffer.bind_index_buffer(IndexBufferView {
    buffer: index_buffer,
    offset: 0, // another accursed offset
               // ^ is that alliteration or assonance 
               // or maybe a different thing
               // I haven't been in English class for a long time
    index_type: IndexType::U16,
});

command_buffer.bind_graphics_pipeline(&pipeline_data.pipeline);
```

## 6. Begin your render pass(es?).

Maybe you would call this more than once if there's more than one render pass in your pipeline.

```rust
// renderer.rs

{ // New scope to prevent compiler whining about borrowing lifetimes    
    let mut encoder = unsafe {
        command_buffer.begin_render_pass_inline( // inline makes things faster maybe sometimes
            &render_pass,
            &framebuffers[frame_index as usize], // the frame the swapchain gave us earlier
            view_rect, // I think I skipped this, you can look it up in an example or something

            // below is the "background color" that will appear 
            // in places that you don't draw anything over
            
            // or perhaps the entire screen if you've done one of these
            // 14,000 steps wrong

            // maybe make it something nice like a soothing blue
            // to help calm your rage when compilation attempt #17,468 
            // still does not draw anything on the screen
            // just like the previous 17,467 times
            &[ClearValue::Color(ClearColor::Float([0.25, 0.53, 0.73, 1.0]))],
        )
}
```

## 7. Bind graphics descriptor sets.

This can maybe be done earlier with the other bindings but I've got this separately in a loop in my renderer for reasons.
```rust
// renderer.rs

encoder.bind_graphics_descriptor_sets(
    pipeline_layout,
    0,  // first_set, for binding sets starting at not set 0...?
    vec![ // put all the sets you want to bind here
        sampler_set,
        texture_set,
    ],
    &[], // offsets of some kind?
);
```

### Wait, what's the encoder thing?

It seems like once you create the encoder, you can (or maybe should?) use that in place of `command_buffer`. Except at the end as you'll see.

## 8. DRAW COMMAND

```rust
// renderer.rs

encoder.draw_indexed(
    start_index..end_index, 
    0,  // base index = ...if you want to start drawing from the middle of your buffer?
    0..1 // instance range...I don't really understand instances still
);

// ALMOST THERE
command_buffer.finish(); // not encoder for some reason
```
If you're not doing indexed drawing you use `draw()` instead. 

There's also some `draw_indirect()` stuff that I haven't looked at yet.

## 9. after hundreds of lines of code
# **PUT THINGS ON SCREEN**

```rust
// renderer.rs

// Submit the command queue.
let submission = Submission {
    // wait for these semaphores to signal before starting
    wait_semaphores: Some((frame_semaphore, PipelineStage::BOTTOM_OF_PIPE)),

    // signal these semaphores after finished
    signal_semaphores: Some(present_semaphore),
    command_buffers: Some(&finished_command_buffer), // the command buffer(s) to execute
};

unsafe {
    // put the submission in a queue
    queue_group.queues[0].submit(submission, None);

    // NOW WE ARE DONE PUT A THING ON THE SCREEN
    match swapchain.present(
        &mut queue_group.queues[0],
        frame_index,
        vec![&present_semaphore],
    ) {
        Ok(()) => (),
        Err(()) => (),
    }
}
```

At this point, I don't know what `BOTTOM_OF_PIPE` means and I don't care.

# Epilogue: Other questions I'm pretending that someone has asked me

## What's with all the `unsafe` blocks in gfx_hal?

`gfx_hal` is in Rust, but the underlying code in the operating system and such is in gross non-Rust languages like C++ or Objective-C, and Rust can't predict what horrible things C++ might do with any pointers you send to it. Even C++ can't predict what horrible things C++ might do with any pointers you send to it. 

Typing `unsafe` 500,000 times is basically just you signing a form that says, "I accept that this code might get a null pointer and segfault even though Rust usually prevents that from happening." 

## I'm an extremely alert reader and you mentioned `nalgebra-glm` once a long time ago.

Good catch! `nalgebra-glm` is a Rust crate that has helpful math things for graphics programming, like vectors and matrices and doing math with vectors and matrices. There are probably others, or you could write the code for that kind of stuff yourself, or you could use `nalgebra-glm`!

## *the choice is youuurrrrrssssss*

## You suck and this horribly long document sucks.

Okay. 

## No really, you're not funny and your references are dated.

Okay. 

## This horribly long document was really helpful and I'm glad I read it.

Okay.

## This horribly long document was sort of helpful I guess.

Okay.

## How can I contact you?

You can't.

## What on Earth compelled you to write this horribly long document?

Writing it out helped me to solidify some concepts in my head, and I even researched things on occasion to answer questions I didn't know the answers to or to check that what I was writing was correct, and doing that helped me learn things!

## Okay but like I really really need to contact you because like 1,231,929 things are wrong or incomplete

Maybe I'll put it on GitHub and let people do pull requests or something.

## Do you really like typing backticks in markdown to make things all codelike?

`Oh goodness yes.`

```
It makes me feel super official and documentative, like a real programmer. 
```

## Documentative?

Yes.

## Please stop beginning your "questions" with "okay".

Never!

## Okay this has probably gone on long enough.

Yes it has.

# THE

# END