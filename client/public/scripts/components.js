const services = document.querySelector('#our_services')

const serviceHTML = (service) => {
  return `
    <div class="lg:w-1/3 sm:w-1/2 p-4">
        <div class="flex relative">
          <img alt="gallery" class="absolute inset-0 w-full h-full object-cover object-center" src="https://dummyimage.com/600x360">
          <div class="px-8 py-10 relative z-10 w-full border-1 border-blue-600 bg-white opacity-0 hover:opacity-100">
            <h2 class="tracking-widest text-sm title-font font-medium text-blue-500 mb-1 uppercase">${service.heading}</h2>
            <h1 class="title-font text-lg font-medium text-gray-900 mb-3">${service.title}</h1>
            <p class="leading-relaxed">${service.desc}</p>
          </div>
        </div>
      </div>
  `
}

const servicesObj = [
  {
    heading: 'secure',
    title: 'We prioritize Security',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmo aliquip ex ea commodo.'
  },
  {
    heading: 'fast',
    title: 'Faster than light',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmo aliquip ex ea commodo.'
  },
  {
    heading: 'privacy',
    title: 'We care about your Privacy',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmo aliquip ex ea commodo.'
  }
]

services.innerHTML = ''
for(s of servicesObj) {
  services.insertAdjacentHTML('beforeend', serviceHTML(s))
}